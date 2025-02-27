document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("current-year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear(); // Sets to 2025 as of current date
  }

  // Burger menu toggle (existing code)
  const burgerIcon = document.querySelector(".burger-icon");
  const navLinks = document.querySelector(".nav-links");

  if (burgerIcon && navLinks) {
    burgerIcon.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }
});

// ==================== COMMON FUNCTIONS ====================

/**
 * Fetches data from the server and returns it as JSON.
 */
const fetchData = async () => {
  try {
    const response = await fetch("/data");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

/**
 * Deletes a record by SIN.
 */
const deleteRecord = async (sin) => {
  try {
    const response = await fetch(`/data/${sin}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete data");
    }
    alert("Data deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting data:", error);
    alert("Error deleting data. Please try again.");
    return false;
  }
};

/**
 * Converts data to CSV format and triggers download.
 */
const downloadCSV = (data) => {
  if (!data || data.length === 0) {
    alert("No data available to download.");
    return;
  }

  // Define CSV headers
  const headers = [
    "Date",
    "Earth - N",
    "Earth-SR",
    "IR-HT Body",
    "IR-HT LT",
    "IR-LT Body",
    "Remarks",
    "SIN",
  ];

  // Convert data to CSV rows
  const rows = data.map((item) => [
    item.date,
    item["earth - n"],
    item["earth-sr"],
    item["ir-ht_body"],
    item["ir-ht_lt"],
    item["ir-lt_body"],
    item.remarks,
    item.SIN,
  ]);

  // Create CSV content
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += headers.join(",") + "\n";
  rows.forEach((row) => {
    csvContent += row.join(",") + "\n";
  });

  // Create a download link and trigger it
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "data_export.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ==================== INDEX.HTML (ADD DATA PAGE) ====================

if (
  window.location.pathname === "/index.html" ||
  window.location.pathname === "/"
) {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("dataForm");

    // Handle form submission
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const rawDate = formData.get("date");
      const [year, month, day] = rawDate.split("-");
      const formattedDate = `${day}-${month}-${year}`;

      const newData = {
        date: formattedDate,
        "earth - n": parseInt(formData.get("earth - n")),
        "earth-sr": parseInt(formData.get("earth-sr")),
        "ir-ht_body": parseInt(formData.get("ir-ht_body")),
        "ir-ht_lt": parseInt(formData.get("ir-ht_lt")),
        "ir-lt_body": parseInt(formData.get("ir-lt_body")),
        remarks: formData.get("remarks"),
        SIN: formData.get("SIN"),
      };

      try {
        const response = await fetch("/data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newData),
        });
        if (!response.ok) {
          throw new Error("Failed to add data");
        }
        alert("Data added successfully");
        form.reset();
      } catch (error) {
        console.error("Error:", error);
        alert("Error adding data. Please try again.");
      }
    });
  });
}

// ==================== VIEW-DATA.HTML (VIEW DATA PAGE) ====================

if (window.location.pathname === "/view-data.html") {
  document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.querySelector("#dataTable tbody");
    const downloadBtn = document.getElementById("downloadCsv");

    // Fetch and display data when the page loads
    const data = await fetchData();
    console.log("Data fetched:", data);

    // Clear the table
    tableBody.innerHTML = "";

    // Loop through the data and create table rows
    data.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td data-label="Date">${item.date}</td>
        <td data-label="Earth - N">${item["earth - n"]}</td>
        <td data-label="Earth-SR">${item["earth-sr"]}</td>
        <td data-label="IR-HT Body">${item["ir-ht_body"]}</td>
        <td data-label="IR-HT LT">${item["ir-ht_lt"]}</td>
        <td data-label="IR-LT Body">${item["ir-lt_body"]}</td>
        <td data-label="Remarks">${item.remarks}</td>
        <td data-label="SIN">${item.SIN}</td>
        <td data-label="Action"><button class="delete-btn" data-sin="${item.SIN}">Delete</button></td>
      `;
      tableBody.appendChild(row);
    });

    // Add event listener to download button
    downloadBtn.addEventListener("click", async () => {
      const data = await fetchData();
      downloadCSV(data);
    });

    // Add event listeners to delete buttons
    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const sin = button.getAttribute("data-sin");
        const isDeleted = await deleteRecord(sin);
        if (isDeleted) {
          // Refresh the table after deletion
          const data = await fetchData();
          tableBody.innerHTML = "";
          data.forEach((item) => {
            const row = document.createElement("tr");
            row.innerHTML = `
              <td data-label="Date">${item.date}</td>
              <td data-label="Earth - N">${item["earth - n"]}</td>
              <td data-label="Earth-SR">${item["earth-sr"]}</td>
              <td data-label="IR-HT Body">${item["ir-ht_body"]}</td>
              <td data-label="IR-HT LT">${item["ir-ht_lt"]}</td>
              <td data-label="IR-LT Body">${item["ir-lt_body"]}</td>
              <td data-label="Remarks">${item.remarks}</td>
              <td data-label="SIN">${item.SIN}</td>
              <td data-label="Action"><button class="delete-btn" data-sin="${item.SIN}">Delete</button></td>
            `;
            tableBody.appendChild(row);
          });
          // Re-add event listeners after refresh
          const newDeleteButtons = document.querySelectorAll(".delete-btn");
          newDeleteButtons.forEach((button) => {
            button.addEventListener("click", async () => {
              const sin = button.getAttribute("data-sin");
              const isDeleted = await deleteRecord(sin);
              if (isDeleted) {
                const data = await fetchData();
                tableBody.innerHTML = "";
                data.forEach((item) => {
                  const row = document.createElement("tr");
                  row.innerHTML = `
                    <td data-label="Date">${item.date}</td>
                    <td data-label="Earth - N">${item["earth - n"]}</td>
                    <td data-label="Earth-SR">${item["earth-sr"]}</td>
                    <td data-label="IR-HT Body">${item["ir-ht_body"]}</td>
                    <td data-label="IR-HT LT">${item["ir-ht_lt"]}</td>
                    <td data-label="IR-LT Body">${item["ir-lt_body"]}</td>
                    <td data-label="Remarks">${item.remarks}</td>
                    <td data-label="SIN">${item.SIN}</td>
                    <td data-label="Action"><button class="delete-btn" data-sin="${item.SIN}">Delete</button></td>
                  `;
                  tableBody.appendChild(row);
                });
              }
            });
          });
        }
      });
    });
  });
}
