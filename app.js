const express = require("express");
const app = express();
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

const axios = require('axios');

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    axios.get("http://jbusch.webhosting2.eeecs.qub.ac.uk/tvapi/?shows").then(results => {
        let showsdata = results.data;
        res.render('index', {showsdata});
        })
        .catch(err => {
            console.log("Error: ", err.message);
    });
});

app.get("/show", async (req, res) => {
    let idvalue = req.query.tvid;
    let getshow = `http://jbusch.webhosting2.eeecs.qub.ac.uk/tvapi/?id=${idvalue}`;
    console.log(getshow);
    
    axios.get(getshow).then(async results => {
        
        let singledata = results.data.show;
        let castdata = results.data.cast;

        // Fetch actor names using their IDs
        let actorNames = await Promise.all(castdata.map(async actor => {
            try {
                let actorDetails = await axios.get(`https://jbusch.webhosting2.eeecs.qub.ac.uk/tvapi/?actor=${actor.actorid}`);
                // Check if the response contains the expected 'actorname' property
                if (actorDetails.data && actorDetails.data.actorname) {
                    return actorDetails.data.actorname;
                } else {
                    console.error(`Invalid actor details for ID ${actor.actorid}:`, actorDetails.data);
                    return null;
                }
            } catch (error) {
                console.error(`Error fetching actor details for ID ${actor.actorid}:`, error.message);
                return null;
            }
        }));

        res.render('details', { singledata, castdata: actorNames });            

        }).catch(err => {
            console.log("Error: ", err.message);
    });
});

app.get("/create", (req, res) => {
    res.render('add');
});

app.post("/create", (req, res) => {

    let senttitle = req.body.fieldTitle;
    let sentimg = req.body.fieldImg;
    let sentdes = req.body.fieldDescr;
    
    const showData = { 
        title: senttitle,
        img: sentimg,
        description: sentdes,
    };

    const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
    }

    let epoint="http://jbusch.webhosting2.eeecs.qub.ac.uk/tvapi/?create&apikey=47057512";

     axios.post(epoint, showData, config).then((response) => {
           console.log(response.data);
           res.render('add', {showData});
        }).catch((err)=>{
           console.log(err.message);
     });
});

app.get("/top", async (req, res) => {

    let topshows = await axios.get("http://jbusch.webhosting2.eeecs.qub.ac.uk/tvapi/?topshows");
    let topactors = await axios.get("http://jbusch.webhosting2.eeecs.qub.ac.uk/tvapi/?topactors");
    let showsdata = topshows.data;
    let actorsdata = topactors.data;

    res.render("topdata", {shows : showsdata , actors: actorsdata});
});

app.listen(3000, () => {
    console.log("Server is running at port 3000");
});