"use strict";
//ChirpApp object//
var ChApp = {};
//Array to hold all chirps//
ChApp.Chirps = [];
ChApp.FObj = [];
ChApp.db = "https://alewischirps.firebaseio.com/";

//holds list of our friends
ChApp.FriendsUrl = [];
ChApp.Friends = [];
ChApp.FriendObjects = [];
ChApp.OthersChirps = [];

//Public chirps constructor
ChApp.chirps = function (message) {
    this.message = message;
    this.time = new Date();
    
};

//Each Friend Object - Constructor//
ChApp.Friends = function (name, firebaseURL) {
    this.name = name;
    this.firebaseURL = firebaseURL;
}


//constructs the url for use in the AJAX calls
ChApp.urlMaker = function (base, array) {
    var url = base;

    if (array) {
        for (var x in array) {
            url += array[x];
        }
    }

    url += ".json";

    return url;
};

//Master AJAX
ChApp.Ajax = function (method, url, callback, async, data) {
    var request = new XMLHttpRequest();

    request.open(method, url, async);

    request.onload = function () {
        if (this.status >= 200 && this.status < 400) {

            var response = JSON.parse(this.response);
            if (callback) { callback(response); }
        } else {
            console.log("Error " + this.status);
        }
    }

    request.onerror = function () {
        console.log("Communication Error" + this.response);
    }
    if (data) {
        request.send(data);
    } else {
        request.send();
    }

};

ChApp.GetProfile = function () {
    var url;

    url = ChApp.urlMaker(ChApp.db, ["Profile"]);
    ChApp.Ajax("GET", url, ChApp.DisplayProfile, true, null);


};

ChApp.DisplayProfile = function (data) {
    if (data) {
        ChApp.myProfile = data;
    }

    var userName = document.getElementById("userName");
    var biography = document.getElementById("bio");
    var picture = document.getElementById("picture");
    //data { name: "Antonio", biography: "student ..............

    //TODO finish this method to add all profile information to page
    userName.innerText = ChApp.myProfile.userName;
    biography.innerText = ChApp.myProfile.biography;
    picture.setAttribute("src", ChApp.myProfile.pictureUrl);
    picture.setAttribute("height", "400px");
    picture.setAttribute("width", "400px");


    if (data) {
        ChApp.GetFriends(null);
    }



};

ChApp.DisplayProfileAfterFA = function (data) {
    var userName = document.getElementById("userName");
    var biography = document.getElementById("bio");
    var picture = document.getElementById("picture");
    //data { name: "Antonio", biography: "student ..............

    //TODO finish this method to add all profile information to page
    userName.innerText = ChApp.myProfile.userName;
    biography.innerText = ChApp.myProfile.biography;
    picture.setAttribute("src", ChApp.myProfile.pictureUrl);
    picture.setAttribute("height", "400px");
    picture.setAttribute("width", "400px");

    //
    updateProfile.innerText = "Update";
    updateProfile.setAttribute("onclick", "ChApp.EditProfile()");
}

ChApp.UpdateProfile = function () {
    var urls = [];
    var bio = document.getElementById("updateBio");
    var pic = document.getElementById("updatePic");
    var userN = document.getElementById("updateUserName");

    if (bio.value !== "") {
       ChApp.myProfile.biography = bio.value
        urls.push([ChApp.urlMaker(ChApp.db, ["Profile/biography"]), bio.value]);
    }

    if (pic.value !== "") {
        ChApp.myProfile.pictureUrl = pic.value;
        urls.push([ChApp.urlMaker(ChApp.db, ["Profile/pictureUrl"]), pic.value]);
    }

    if (userN.value !== "") {
        ChApp.myProfile.userName = userN.value;
        urls.push([ChApp.urlMaker(ChApp.db, ["Profile/userName"]), userN.value]);
    }


    for (var x in urls) {

        var data = JSON.stringify(urls[x][1]);

        ChApp.Ajax("PUT", urls[x][0], ChApp.DisplayProfileAfterFA, true, data);
    }




};

ChApp.EditProfile = function () {
    var userName = document.getElementById("userName");
    var bio = document.getElementById("bio");
    var updateProfile = document.getElementById("updateProfile");

    userName.innerHTML = "<input class=\"col-md-12\"type=\"text\" id=\"updateUserName\" placeholder=\"" + ChApp.myProfile.userName + "\"/>";
    bio.innerHTML = "<input type=\"text\" id=\"updateBio\" placeholder=\"" + ChApp.myProfile.biography + "\"/>";
    bio.innerHTML += "<br/><input type=\"text\" id=\"updatePic\" placeholder=\"" + ChApp.myProfile.pictureUrl + "\"/>"

    updateProfile.innerText = "Submit Changes";
    updateProfile.setAttribute("onclick", "ChApp.UpdateProfile()");
};
//send chirp
ChApp.createChirp = function () {
    
    var message = document.getElementById("message").value;

    ChApp.Lastchirp = new ChApp.chirps(message.value);

    var chirp = JSON.stringify(ChApp.Lastchirp);

    var url = ChApp.urlMaker(ChApp.db, ["/Profile/Chirps/"]);

    ChApp.Ajax("POST", url, ChApp.addChirpKey, true, chirp);

    message.value = " ";
    
};

ChApp.addChirpKey = function (data) {
    ChApp.Lastchirp.key = data.name;
    ChApp.Lastchirp.ours = true;

    ChApp.Chirps.push(ChApp.Lastchirp);

    ChApp.Lastchirp = null;

    ChApp.RedrawChirps();

};

ChApp.GetChirps = function (urlparam) {
    if (urlparam) {
        var url = ChApp.urlMaker(urlparam, ["Profile/Chirps/"]);
    } else {
         url = ChApp.urlMaker(ChApp.db, ["Profile/Chirps/"]);
    }


    //all friends tweets we need to do a for loop. 
    // for ever friend our Friends array we need to pass
    //Their url into the urlMaker function and do a get request
    // and store the tweet in our tweets array.

    ChApp.Ajax("GET", url, ChApp.fillChirpsArray, true, null);

};

ChApp.GetAllChirps = function () {
    var url = ChApp.urlMaker(ChApp.db, ["Profile/Chirps"]);
    ChApp.Ajax("GET", url, ChApp.fillOurTweetsArray, true, null);

    for (var i = 0; i < ChApp.FriendsUrl.length; i++) {
        var f_url = ChApp.urlMaker(ChApp.FriendsUrl[i], ["Profile/"]);
        ChApp.Ajax("GET", f_url, ChApp.fillChirpsArray, true, null);
    }

}

ChApp.fillChirpsArray = function (data) {
    ChApp.FObj.push(data);

    var lastObj = ChApp.FObj[ChApp.FObj.length - 1];

    for (var x in lastObj.chirps) {
        lastObj.chirps[x].userName = lastObj.userName;
        lastObj.chirps[x].ours = false;

        ChApp.Chirps.push(lastObj.chirps[x]);
    }

    ChApp.RedrawChirps();

};

ChApp.fillOurChirpsArray = function (data) {
    for (var x in data) {
        data[x].ours = true;
        data[x].key = x;
        ChApp.Chirps.push(data[x]);
    }
}

ChApp.RedrawChirps = function () {
    var chirpsList = document.getElementById("tbody");
    ChApp.Sort();
    chirpsList.innerHTML = " ";

    for (var i = 0; i < ChApp.Chirps.length; i++) {
        if (ChApp.Chirps[i].ours) {
            chirpsList.innerHTML += "<tr><td>" + ChApp.Chirps[i].message + "</td><td> Me </td><td> " + ChApp.Chirps[i].time.toString() + '</td><td><button class="btn btn-default" onclick="ChApp.Edit(\'' + ChApp.Chirps[i].key + '\')">Edit</button></td><td><button class="btn btn-danger" onclick="ChApp.DeleteChirp(\'' + ChApp.Chirps[i].key + '\')">Delete</button> </td>';
        } else {
            chirpsList.innerHTML += "<tr><td>" + ChApp.Chirps[i].message + "</td><td>" + ChApp.Chirps[i].userName + "</td><td>" + ChApp.Chirps[i].time.toString() + "</td></tr>";
        }


    }
};

ChApp.Sort = function () {
    ChApp.Chirps.sort(function (a, b) {
        if (a.time > b.time)
            return -1;
        if (a.time < b.time)
            return 1;
        // a must be equal to b
        return 0;
    });
};

ChApp.EditChirp = function (key) {
    var message = document.getElementById("message").value;

    ChApp.Lastchirp = new ChApp.chirps(message);

    var url = ChApp.urlMaker(ChApp.db, ["/Profile/chirps/" + key]);

    for (var i = 0; i < ChApp.Chirps.length; i++) {
        if (ChApp.Chirps[i].key === key) {
            ChApp.Chirps.splice(i, 1, ChApp.Lastchirp);
        }
    }

    var chirp = JSON.stringify(ChApp.Lastchirp);

    ChApp.Ajax("PUT", url, ChApp.RedrawChirps, true, chirp);

    document.getElementById("message").value = " ";
};

ChApp.DeleteChirp = function (key) {
    var url = ChApp.urlMaker(ChApp.db, ["/Profile/chirps/" + key]);

   ChApp.Ajax("DELETE", url, null, true, null);

    for (var i = 0; i < ChApp.Chirps.length; i++) {
        if (ChApp.Chirps[i].key === key) {
            ChApp.Chirps.splice(i, 1);
        }
    }

   ChApp.RedrawChirps();
};

//--------------------------------------------------Friend Crud--------------------------

//Create 
ChApp.followFriend = function () {
    //we need to get the url that is entered into the input box in the nav bar
    //send it to the database and put it in our array

    var friend = document.getElementById("FriendUrl");
    var friendUrl = "https://" + friend.value + ".firebaseio.com/";

    var timeFollowing = new ChApp.Friend(friendUrl);
    var url = ChApp.urlMaker(ChApp.db, ["/Profile/Friends/"]);
    ChApp.FriendsUrl.push(friendUrl);
    timeFollowing = JSON.stringify(timeFollowing);

    ChApp.Ajax("POST", url, ChApp.GetLastFriendProfile, true, timeFollowing);

    friend.value = " ";
};

//Read 
ChApp.GetFriends = function (urlparam) {
    if (!urlparam) {
        var url = ChApp.urlMaker(ChApp.db, ["Profile/Friends/"]);

        ChApp.Ajax("GET", url, ChApp.FriendsToArray, true, null);
    } else {
         url = ChApp.urlMaker(urlparam, ["Profile/Friends/"]);

        ChApp.Ajax("GET", url, ChApp.FriendsToArray2, true, null);
    }

};

//Callback for GetFriends that displays the people you follow on the page.
ChApp.FriendsToArray = function (data) {
    //[url, url, url...
    for (var x in data) {
        ChApp.FriendsUrl.push(data[x].friendUrl);
    }
    ChApp.GetAllChirps();
    ChApp.GetFriendProfile();
};

//Get request to get the profile data from a given url
ChApp.GetFriendProfile = function (key) {
    var url;

    //make urls
    for (var i = 0; i < ChApp.FriendsUrl.length; i++) {
        url = ChApp.urlMaker(ChApp.FriendsUrl[i], ["Profile/"]);

        ChApp.Ajax("GET", url, ChApp.GetFriendProfileCallBack, true, null);
    }


};

ChApp.GetLastFriendProfile = function (key) {
    var url;

    //make urls
    url = ChApp.urlMaker(ChApp.FriendsUrl[ChApp.FriendsUrl.length - 1], ["Profile/"]);

    ChApp.Ajax("GET", url, ChApp.GetFriendProfileCallBack, true, null);



};

//we want to get the friends a friend object into the Friends Objects array
ChApp.GetFriendProfileCallBack = function (data) {
    ChApp.FriendObjects.push(data);
    ChApp.DrawFriends();
};

//Display
ChApp.DrawFriends = function () {
    var friendslist = document.getElementById("friendslist");
    friendslist.innerHTML = " ";

    ChApp.SortFriends();

    for (var i in ChApp.FriendObjects) {
        friendslist.innerHTML += '<li data-toggle="modal" data-target="#myModal" onclick="ChApp.ViewFriendProfile(\'' + ChApp.FriendObjects[i].personalUrl + '\')">' + ChApp.FriendObjects[i].userName + '</li>';

    }

};

//Sort the friends array by name
ChApp.SortFriends = function () {
    ChApp.FriendObjects.sort(function (a, b) {
        if (a.userName > b.userName)
            return 1;
        if (a.userName < b.userName)
            return -1;
        // a must be equal to b
        return 0;
    });
};

//ViewFriendProfile
ChApp.ViewFriendProfile = function (urlparam) {
    var url = ChApp.urlMaker(urlparam, ["/Profile"]);
    ChApp.Ajax("GET", url, ChApp.DisplayFriendProfile, true, null);
};

//Displays Modal
ChApp.DisplayFriendProfile = function (data) {
    var name = document.getElementById("myModalLabel");
    var profilePic = document.getElementById("profilePic");
    var friendsList = document.getElementById("friendsList");
    var biography = document.getElementById("biography2");
    var friendChirps = document.getElementById("friendChirps");
    var headingFT = document.getElementById("fchirps");

    headingFT.innerText = data.userName + "'s Chirps";
    name.innerText = data.userName;
    biography.innerText = data.biography;
    profilePic.setAttribute("src", data.pictureUrl);

    for (var x in data.Friends) {

        friendsList.innerHTML += "<li>" + ChApp.getDbname(data.Friends[x].friendUrl) + "</li>";
    }


    for (var x in data.chirps) {
        friendChirps.innerHTML += "<li>" + data.chirps[x].message + "</li>";
    }

};

ChApp.getDbname = function (str) {
    str = str.split("");
    var secondslash = str.indexOf("/") + 2;
    str.splice(0, secondslash);


    var firstdot = str.indexOf(".");

    str.splice(firstdot, str.length);

    str = str.join("");
    return str;
};
//Helper to format the friend string
//

ChApp.ClearModal = function () {
    document.getElementById("friendsList").innerHTML = " ";
    document.getElementById("friendTweets").innerHTML = " ";
};

//Read 2 ---- Friends of Friends
ChApp.FoF = function () {
    //for each friend in our friends 
    //list we want to read their friendslist and 
    //add it to our FoF array

};

//Delete  --- unfollow
ChApp.unfollowFriend = function () {

};



//------------------------------------------------------------------------------------------
// We also want to Poll for tweets -I think

//Notes during post of tweet POST - push to array - get Id from the response
//Delete delete then splice out of the array 
//Update 

ChApp.GetProfile(null);



//My Profile//
ChApp.AboutMe = {
    userName: "Antonio Lewis",
    bio: "This is a bio all about Antonio",
    picture: "insert link"
}


//Each Private Message Constructor//
ChApp.PrivateMessages = function (name, message) {
    this.name = name;
    this.message = message;
    this.timestamp = Date.time();
};

















ChApp.mockProfile = function () {
    userName = "David Ortiz";
    picture = "";
    bio = "I'm the effin man!";
    url = "https://alewischirps.firebaseio.com/";
    ChApp.friends = [];
}//Mock Profile


