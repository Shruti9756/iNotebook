const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

/// ROUTE 1: Get All the notes using  : GET "/api/notes/fetchallnotes" . loging required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error occured...");
  }
});

/// ROUTE 2: add a new notes using  : POST "/api/notes/addnote" . loging required
router.post(
  "/addnote",
  fetchuser,
  [
    // validations
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Enter a valid description ").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;

      //if there are errors , return bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();
      res.json(note);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error occured...");
    }
  }
);

/// ROUTE 3: update an existing note using  : PUT "/api/notes/updatenote" . loging required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;

    //if there are errors , return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }
    /// find the note to be updated and update it
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not found!!");
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed!! ");
    }
    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error occured...");
  }
});
/// ROUTE 4: delete an existing note using  : DELETE "/api/notes/deletenote" . loging required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    /// find the note to be deleted and delete it
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not found!!");
    }
    //Allow deletion only if user owns this note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed!! ");
    }
    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ Success: "Notes has been deleted!!!", note: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error occured...");
  }
});

module.exports = router;
