const multer = require("multer");
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const express = require("express");

const upload = multer({ dest: "uploads" });


// Connect to MongoDB
mongoose.connect(process.env.DATA_BASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.error('Connection error', err));

// Define the Mongoose model for File
const File = require("./models/files");

const app = express();
app.use(express.urlencoded({extended : true}))
app.set("view engine", "ejs");

// Routes
app.get("/", (req, res) => {
    res.render("index");
});

app.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }

    const fileData = {
        path: req.file.path,
        originalFileName: req.file.originalname, // Correct field name
    };

    if (req.body.password != null && req.body.password !== "") {
        try {
            fileData.password = await bcrypt.hash(req.body.password, 11);
        } catch (error) {
            return res.status(500).send("Error hashing password");
        }
    }

    try {
        const file = await File.create(fileData);
        
        res.render("index", { fileLink: `${req.headers.origin}/file/${file._id}` });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error saving file");
    }
});

app.get("/file/:id", async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).send("File not found");
        }

        if(file.password != null){
            if(req.body.password == null){
                res.render("password")
                return
            }
            if (!(await bcrypt.compare(req.body.password , file.password))){
                res.render("password" , {error :true})
                return
            }

        }

        file.downloadCount++;
        await file.save();
        console.log(file.downloadCount)

        res.download(file.path, file.originalFileName, (err) => {
            if (err) {
                console.error("Error in res.download:", err);
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error downloading file");
    }
});

app.route("/file/:id").get(handleDownload).post(handleDownload)


async function handleDownload (req, res){
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).send("File not found");
        }

        if(file.password != null){
            if(req.body.password == null){
                res.render("password")
                return
            }
            if (!(await bcrypt.compare(req.body.password , file.password))){
                res.render("password" , {error :true})
                return
            }

        }

        file.downloadCount++;
        await file.save();
        console.log(file.downloadCount)

        res.download(file.path, file.originalFileName, (err) => {
            if (err) {
                console.error("Error in res.download:", err);
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error downloading file");
    }
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
