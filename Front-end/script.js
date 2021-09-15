
let loginBox = document.getElementById("login");
let logoutBox = document.getElementById("logout");
let container = document.getElementById("container");
let mainPage = document.getElementById("mainPage");
let msg = document.getElementById("msg");
let notes = document.getElementById("notes");
let newNoteBtn = document.getElementById("newNote");

let usrArray; 
let pswArray; 

if(window.localStorage.getItem("name") !== null && window.localStorage.getItem("psw") !== null){
    usrArray = JSON.parse(window.localStorage.getItem("name"));
    pswArray = JSON.parse(window.localStorage.getItem("psw"));

}else{
    usrArray = ["nalle"];
    pswArray = ["puh"];
}
logoutBox.style.visibility="hidden"; 
mainPage.style.visibility="hidden";
newNoteBtn.style.visibility = "hidden";
//Checks if user is in edit mode
function CheckLoginStatus(){
    if(window.localStorage.getItem("makingNote") === "true"){
        document.getElementById("viewNote").style.visibility = "hidden";
        newNoteBtn.style.visibility = "hidden";
        notes.style.visibility = "visible";
        newNoteBtn.style.visibility = "hidden";
        document.getElementById("closeNotes").style.visibility = "hidden";
    }else if(window.localStorage.getItem("makingNote") === "false"){
        notes.style.visibility = "hidden";

        // newNoteBtn.style.visibility = "visible";
    }
    if(window.localStorage.getItem("viewingNotes") === "true"){
        document.getElementById("viewNote").style.visibility = "hidden";
        newNoteBtn.style.visibility = "hidden";
        document.getElementById("closeNotes").style.visibility = "visible";
        HandleNotes();
    }else if(window.localStorage.getItem("viewingNotes") === "false" && window.localStorage.getItem("signedIn") === "true"  && window.localStorage.getItem("makingNote") === "false")
    {
        document.getElementById("viewNote").style.visibility = "visible";
        newNoteBtn.style.visibility = "visible";
        document.getElementById("closeNotes").style.visibility = "hidden";
        document.getElementById("overviewNote").innerHTML = "";
    }else if(window.localStorage.getItem("viewingNotes") === "false" && window.localStorage.getItem("signedIn") === "false"){
        document.getElementById("viewNote").style.visibility = "hidden";
        newNoteBtn.style.visibility = "hidden";
        document.getElementById("closeNotes").style.visibility = "hidden";
    }
    
}
//Checks if the user's signed in or not
let checkStatus = function(){
    if(window.localStorage.getItem("signedIn") == "true"){
        signedIn(window.localStorage.getItem("signedinUser"));
        CheckLoginStatus();
    }
    else if(window.localStorage.getItem("signedIn") == "false"){

        window.localStorage.setItem("viewingNotes", "false");
        CheckLoginStatus();
        signedOut();
    }
    
}

//What shows when signed in
function signedIn(user){
    container.style.visibility="hidden";
    logoutBox.style.visibility="visible";
    loginBox.style.visibility="hidden";  
    mainPage.style.visibility="visible";
}

//What shows when signed out
function signedOut(){
    msg.innerHTML = "";
    container.style.visibility="visible";
    logoutBox.style.visibility="hidden";
    loginBox.style.visibility="visible";  
    newNoteBtn.style.visibility = "hidden";
    notes.style.visibility = "hidden";
    mainPage.style.visibility="hidden";
}



// Logg in
document.getElementById("logsub").addEventListener("click", function(){
    event.preventDefault();
    let userName = document.getElementById("usr").value;
    let userPsw = document.getElementById("psw").value;
    let i = usrArray.indexOf(userName);

    //Checks if the username is in the arrays
    if(usrArray.indexOf(userName) ==-1 || userName == "" || pswArray[i] != userPsw || userPsw == "")
    {
        msg.innerHTML = "";
        msg.insertAdjacentHTML("afterbegin", "Error. Could not sign in.");
    }
    else{
        document.cookie = "signedIn=true";
        window.localStorage.setItem("signedIn", "true");
        window.localStorage.setItem("signedinUser", userName);
        checkStatus();
    }
});


//Signing out
document.getElementById("outBtn").addEventListener("click", function (){
    window.localStorage.setItem("signedIn", "false");
    checkStatus();
    window.localStorage.removeItem("signedinUser"); 
    

});




/***********************---NOTES---***********************/ 

tinymce.init({
    selector: "#textContent",
    setup: function(editor){
        editor.on("change", function(){
            editor.save();
        });
    }
});

// Nytt dokument
newNoteBtn.addEventListener("click", function(){
    window.localStorage.setItem("makingNote", "true");
    notes.style.visibility = "visible";
    newNoteBtn.style.visibility = "hidden";
    
    window.localStorage.setItem("currentNote", null);
    
    document.getElementById("noteName").value = "";
    tinymce.get("textContent").setContent("");
    CheckLoginStatus();
});

// Save or update note
document.getElementById("saveBtn").addEventListener("click", function(){ 
    document.getElementById("watchNote").innerHTML = "";

    //Note info
    let note = {id: window.localStorage.getItem("currentNote"), noteName: document.getElementById("noteName").value, noteContent: document.getElementById("textContent").value};
   
    // Send to backend
    var request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(note),
    }
    fetch(`http://localhost:3000/newNote/`, request)
    .then(res=> res.json())
    .then(data => {
        console.log("NewNote added!");
        console.log(data);
    });


    
    window.localStorage.setItem("makingNote", "false");
    CheckLoginStatus();
});


//Close writing note
document.getElementById("closeWriting").addEventListener("click", function(){
    window.localStorage.setItem("makingNote", "false");
    CheckLoginStatus();
});

//View existing notes, option to edit them and delete them
document.getElementById("viewNote").addEventListener("click", function(){  
    window.localStorage.setItem("viewingNotes", "true");
    CheckLoginStatus();
});

// Go back from viewing notes
document.getElementById("closeNotes").addEventListener("click", function(){  
    document.getElementById("watchNote").innerHTML = ""; 
    window.localStorage.setItem("viewingNotes", "false");
    CheckLoginStatus();

});

//Print existing notes, update or delete them
function HandleNotes(){
    let container = document.getElementById("overviewNote");
    container.innerHTML = "";
    var request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        //body: JSON.stringify(),
    }
    fetch(`http://localhost:3000/viewNote/`, request)
    .then(res=> res.json())
    .then(data => {
        console.log("viewving notes!");
        console.log(data);
        
        for(obj in data){
            if(data[obj].deleted !== 1){
                console.log(data[obj].deleted);
                container.insertAdjacentHTML("beforeend", '<button id='+ data[obj].id +' class = "viewNoteBtn">' + data[obj].noteName + '</button>');   
            }
        }
        //Checks witch note pressing and then showing the content
        container.addEventListener("click", function(evt){
            if(evt.target.id !== ""){

                document.getElementById("watchNote").innerHTML = "";
                let targetNote = parseInt(evt.target.id);

                container.innerHTML = "";

                for(obj in data){
                    if(data[obj].id ===targetNote){
                        document.getElementById("watchNote").insertAdjacentHTML("beforeend", '<div id = "lookNoteContainer"><div id = "lookNoteName">' + data[obj].noteName +'</div>'+ '<div id = "lookNoteContent">' + data[obj].noteContent + '</div>' +'<div><button id ="editNote" class = "lookNoteBtn">Edit</button><button id ="deleteNote" class = "lookNoteBtn">Delete</button></div></div>');   
                        window.localStorage.setItem("currentNote", data[obj].id);
                    } 
                }
                //Close the note
                document.getElementById("closeWriting").addEventListener("click", function(){
                    document.getElementById("watchNote").innerHTML = "";
                });


                // //Edit the note
                document.getElementById("editNote").addEventListener("click", function(){
                    window.localStorage.setItem("viewingNotes", "false");
                    let currentNoteId = window.localStorage.getItem("currentNote");
                    let edit;
                    

                    for(obj in data){
                        if(data[obj].id.toString() === currentNoteId){
                            window.localStorage.setItem("makingNote", "true");
                            window.localStorage.setItem("viewingnotes", "false");
                            CheckLoginStatus();

                            edit = {noteName: data[obj].noteName, noteContent: data[obj].noteContent}
                            

                            console.log(edit.noteContent);
                            document.getElementById("noteName").value = edit.noteName;
                            tinymce.get("textContent").setContent(edit.noteContent);
                        }
                    }
                });

                //Delet the note but not from the database
                document.getElementById("deleteNote").addEventListener("click", function(){
                    

                    let currentNoteId = window.localStorage.getItem("currentNote");
                    for(obj in data){
                        if(data[obj].id.toString() === currentNoteId){
                            // Send to backend
                            
                            let send = {id: currentNoteId}
                            var request = {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(send),
                            }
                            fetch(`http://localhost:3000/deleteNote/`, request)
                            .then(res=> res.json())
                            .then(data => {
                                console.log("Note deleted!");
                                console.log(data);
                            });
                            

                        }
                    }
                    document.getElementById("watchNote").innerHTML = "";

                    document.getElementById("watchNote").insertAdjacentHTML("beforeend", "<div class ='deleted'><h2>Deleted!</h2></div>")
                  
                });
            }
        });
        
    });
}


checkStatus();
