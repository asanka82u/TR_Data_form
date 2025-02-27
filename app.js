const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "data.json");

app.use(bodyParser.json());
app.use(express.static("public")); // Serve static files from the 'public' directory

// Endpoint to get all data
app.get("/data", (req, res) => {
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading data");
    }
    res.json(JSON.parse(data));
  });
});

// Endpoint to add new data
app.post("/data", (req, res) => {
  const newData = req.body;

  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading data");
    }

    const jsonData = JSON.parse(data);
    jsonData.push(newData);

    fs.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) {
        return res.status(500).send("Error writing data");
      }
      res.status(201).send("Data added successfully");
    });
  });
});

// Endpoint to delete data by SIN
app.delete("/data/:sin", (req, res) => {
  const sinToDelete = req.params.sin;

  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading data");
    }

    const jsonData = JSON.parse(data);
    const updatedData = jsonData.filter((item) => item.SIN !== sinToDelete);

    fs.writeFile(DATA_FILE, JSON.stringify(updatedData, null, 2), (err) => {
      if (err) {
        return res.status(500).send("Error writing data");
      }
      res.status(200).send("Data deleted successfully");
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
