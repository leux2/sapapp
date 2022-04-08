const express = require('express');
const bodyParser = require('body-parser');
const xssec = require('@sap/xssec');

const app = express();
app.use(bodyParser.json());

const xsenv = require('@sap/xsenv')
xsenv.loadEnv();
const services = xsenv.getServices({
    uaa: {tag: 'xsuaa'},
    hana: {tag: 'hana'}
});

const hdbext = require('@sap/hdbext')
app.use(hdbext.middleware(services.hana))

const passport = require('passport');
passport.use('JWT', new xssec.JWTStrategy(services.uaa));
app.use(passport.initialize());
app.use(
    passport.authenticate("JWT", {
      session: false,
    })
  );


app.get('/srv/user', (req,res) => {
    res.status(200).send("A mers boss!!!!");
})

//"MYAPPHANA_HDI_DB_1"."myapphana.db::books"
app.get('/srv/db', (req,res,next) => {
    req.db.exec(`SELECT * FROM "myapphana.db::books"`
    , (err,result) => {
        if(err){
            return res.type("text/plain").status(500).send(`ERROR: ${JSON.stringify(err)}`);
        }
        return res.type("application/json").status(200).send(result);
    })
})

app.post('/srv/addData', (req,res,next) => {

    req.db.exec(`INSERT INTO "myapphana.db::books" VALUES('${req.body.title}','${req.body.author}')`,(err,result) => {
        if(err){
            return res.type('text/plain').status(500).send('ERROR: ' + err);
        }
        res.status(200).send('DB Succesfully Updated');
    })
})


const port = 8080 || process.env.PORT;
app.listen(port, () => {
    console.log(`Servert is listening on port ${port}`);
})
