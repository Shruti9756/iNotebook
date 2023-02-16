import React from "react";
import noteContext from "./noteContext";
import { useState } from "react";
// import { json } from "react-router-dom";

const NoteState = (props) => {
  
  const [notes, setNotes] = useState([]);

  //fetch  all note
  const getNotes =async () => {
    console.log(localStorage.getItem('auth-token'));
    const response = await fetch('http://localhost:5000/api/notes/fetchallnotes', {
      method: "GET", // *GET, POST, PUT, DELETE, etc.

      headers: {
        'Content-Type': 'application/json',
        "auth-token": localStorage.getItem('token')
       
      },
      
    });
    
    const json = await response.json();
    setNotes(json);
    
     
  };
  // Add a note
  const addNote =async (title, description, tag) => {
    // todo: API call
    const response = await fetch('http://localhost:5000/api/notes/addnote', {
      method: "POST", // *GET, POST, PUT, DELETE, etc.

      headers: {
        "Content-Type": "application/json",
        "auth-token":localStorage.getItem('token')
      },

      body: JSON.stringify({title,description,tag}),
    });
    const json =await response.json();
    console.log(json);
    const note = json;
    setNotes(notes.concat(note));
  };

  //Delete a note
  const deleteNote = async(id ) => {
    const response = await fetch(`http://localhost:5000/api/notes/deletenote/${id}`, {
      method: "DELETE", // *GET, POST, PUT, DELETE, etc.

      headers: {
        "Content-Type": "application/json",
        "auth-token":localStorage.getItem('token')
      }
    });
    const json =await response.json();
    console.log(json);
    
    const newNotes = notes.filter((note) => {
      return note._id !== id;
    });
    setNotes(newNotes);
  };
  //Edit a note
  const editNote = async (id, title, description, tag) => {
    // API call
    const response = await fetch(`http://localhost:5000/api/notes/updatenote/${id}`, {
      method: "PUT", // *GET, POST, PUT, DELETE, etc.

      headers: {
        "Content-Type": "application/json",
        "auth-token":localStorage.getItem('token')
      },

      body: JSON.stringify({title,description,tag}),
    });
    const json =await response.json();
    console.log(json);
    let newNotes = JSON.parse(JSON.stringify(notes))
    //LOgic to edit in client
    for (let index = 0; index < newNotes.length; index++) {
      const element = newNotes[index];
      if (element._id === id) {
        newNotes[index].title = title;
        newNotes[index].description = description;
        newNotes[index].tag = tag;
        break;
      }
      
    }
    setNotes(newNotes);
  };
  return (
    <noteContext.Provider value={{ notes, addNote, deleteNote, editNote,getNotes }}>
      {props.children}
    </noteContext.Provider>
  );
};

export default NoteState;
