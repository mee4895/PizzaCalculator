const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
app.use(bodyParser.urlencoded({ extended: true }));
const HashMap = require('hashmap');
const dirname = fs.realpathSync('./');

var teams = new HashMap();
var ingredients = JSON.parse(fs.readFileSync(__dirname + '/data/ingredients.json', 'utf8'));
var suggestions = new HashMap();

// build api endpoint for getting js files
fs.readdirSync(dirname + '/src/js').forEach(file => {
    app.get('/js/' + file, function (req, res) {
        res.status(200).sendFile(dirname + '/src/js/' + file);
    });
});

// build api endpoint for getting bootstrap files
fs.readdirSync(dirname + '/node_modules/bootstrap/dist/css').forEach(file => {
    app.get('/css/' + file, function (req, res) {
        res.status(200).sendFile(dirname + '/node_modules/bootstrap/dist/css/' + file);
    });
});

app.get('/', function (req, res) {
    res.status(200).sendFile(__dirname + "/index.htm");
});

app.get('/teams', function (req, res) {
    res.status(200).sendFile(__dirname + "/teamPage.html");
});

app.get('/pizzas/amount', function (req, res) {
    let teamname = req.body.teamname;
    if (teamname != undefined) {
        let amount = {
            amount: teams.get(teamname).pizza_count
        };
        res.status(200).end(JSON.stringify(amount));
    } else {
        res.sendStatus(400);
    }
});

app.get('/pizzas/ingredients', function (req, res) {
    if (ingredients.length > 0) {
        res.status(200).end(JSON.stringify(ingredients));
    } else {
        res.sendStatus(404);
    }
});

app.get('/pizzas/suggestions', function (req, res) {
    let teamname = req.body.teamname;
    if (teamname != undefined) {
        // TODO 
    } else {
        res.sendStatus(400);
    }
});

app.post('/sessioncreate/', function (req, res) {
    let teamname = req.body.teamname;
    if (teamname != undefined) {
        console.log('Creating team ' + teamname);
        let data = {
            teamsize: {
                number: 0,
                type: 'Not defined'
            },
            pizza_count: 0
        };
        teams.set(teamname, data);
        res.status(200).sendFile(__dirname + '/js/teamPage.js');
        res.redirect(302, '/teams/?teamname=' + teamname);
        res.status(200).end(JSON.stringify({ teamname: teamname }));
    } else {
        console.log('Creating Team: Failure because of undefined teamname!');
        res.sendStatus(400);
    }
});

app.post('/teams/teamsize/', function (req, res) {
    let count = req.body.count;
    let type = req.body.type;
    let teamname = req.body.teamname;
    if (count != undefined && type != undefined && teamname != undefined) {
        console.log('Update team size for team' + teamname);
        let pizza_count = computeNumberOfPizzas(count, type);
        let data = {
            teamsize: {
                number: count,
                type: type
            },
            pizza_count: pizza_count
        };
        teams.set(teamname, data);
        res.redirect(302, '/teams/?teamname=' + teamname);
        res.status(200).end(JSON.stringify({ teamname: teamname, data: data }));
    } else {
        console.log('Update team size failed');
        res.sendStatus(400);
    }
});

function computeNumberOfPizzas(count, type) {
    return 4; // TODO
};

function saveToFile(data, filename = "tfmap.log", exitOnWrite = false) {
    let folderName = "results";
    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }
    fs.writeFileSync('results/' + filename, data);
    console.log("The file was saved!");
    if (exitOnWrite) {
        process.exit(0);
    }
}

var server = app.listen(8081, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("REST server listening at http://%s:%s", host, port);
});