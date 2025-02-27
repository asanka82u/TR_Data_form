require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// GitHub configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Use env variable for security
const REPO_OWNER = "asanka82u"; // Replace with your GitHub username
const REPO_NAME = "tr_data_json"; // Your repo name
const FILE_PATH = "data.json"; // File path in the repo

app.use(bodyParser.json());
app.use(express.static("public"));

// Helper function to get the current file SHA and content
const getFileDetails = async () => {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });
  const data = await response.json();
  return {
    sha: data.sha,
    content: JSON.parse(Buffer.from(data.content, "base64").toString("utf8")),
  };
};

// Endpoint to get all data
app.get("/data", async (req, res) => {
  try {
    const { content } = await getFileDetails();
    res.json(content);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error reading data");
  }
});

// Endpoint to add new data
app.post("/data", async (req, res) => {
  try {
    const newData = req.body;
    const { sha, content } = await getFileDetails();
    content.push(newData);

    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        message: "Add new data",
        content: Buffer.from(JSON.stringify(content, null, 2)).toString(
          "base64"
        ),
        sha: sha,
      }),
    });

    if (!response.ok) throw new Error("Failed to update file");
    res.status(201).send("Data added successfully");
  } catch (error) {
    console.error("Error adding data:", error);
    res.status(500).send("Error writing data");
  }
});

// Endpoint to delete data by SIN
app.delete("/data/:sin", async (req, res) => {
  try {
    const sinToDelete = req.params.sin;
    const { sha, content } = await getFileDetails();
    const updatedData = content.filter((item) => item.SIN !== sinToDelete);

    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        message: "Delete data",
        content: Buffer.from(JSON.stringify(updatedData, null, 2)).toString(
          "base64"
        ),
        sha: sha,
      }),
    });

    if (!response.ok) throw new Error("Failed to update file");
    res.status(200).send("Data deleted successfully");
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).send("Error writing data");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
