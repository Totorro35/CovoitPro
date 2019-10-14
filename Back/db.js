/**
 *  class Path
 *  Is a class for represent a between an adresse and the source destination of company
 * 
 * @param {*} id The identifiant of User
 * @param {*} lat The latitude of adress
 * @param {*} lng The longitude of adress
 * @param {*} date The date of the path
 * @param {*} time The time of the path
 */
function Path(id, lat, lng, date, time) {
    this.id = id;
    this.lat = lat;
    this.lng = lng;
    this.date = date;
    this.time = time;
}

/**
 * Database of the system.
 */
var paths = [];

/**
 * Request Http Listener
 * @param {*} app 
 */
var request = function (app) {

    /**
     * The function to add a Path in DataBase
     */
    app.post("/addPath", function (req, res) {
        var json = JSON.parse(Object.keys(req.body)[0]);
        var id = json.id;
        var lat = json.lat;
        var lng = json.lng;
        var date = json.date;
        var time = json.time;
        path = new Path(id, lat, lng, date, time);
        paths.push(path);
        res.append("Access-Control-Allow-Origin", "*").status(200).send("");
    });

    /**
     * The function to get All Path for an input datetime
     */
    app.post("/getPaths", function (req, res) {
        var json = JSON.parse(Object.keys(req.body)[0]);
        var date = json.date;
        var time = json.time;
        var output_data = "[";
        var nb_elem = 0;
        for (let index = 0; index < paths.length; index++) {
            const element = paths[index];
            if (element.date == date && element.time == time) {
                if (nb_elem != 0) {
                    output_data += ",";
                }
                var data = "{ \"id\" : \"" + element.id +
                    "\", \"lat\" : \"" + element.lat +
                    "\", \"lng\" : \"" + element.lng +
                    "\", \"date\" : \"" + element.date +
                    "\", \"time\" : \"" + element.time +
                    "\"}";
                output_data += data;
                nb_elem++;
            }
        }
        output_data += "]"
        res.append("Access-Control-Allow-Origin", "*").status(200).send(output_data);
    });

    /**
     * Fonction to display all database
     */
    app.post("/cout", function (req, res) {
        var output_data = "[";
        var nb_elem = 0;
        for (let index = 0; index < trajets.length; index++) {
            const element = trajets[index];
            if (nb_elem != 0) {
                output_data += ",";
            }
            var data = "{ \"identifiant\" : \"" + element.identifiant +
                "\", \"lat\" : \"" + element.lat +
                "\", \"lng\" : \"" + element.lng +
                "\", \"date\" : \"" + element.date +
                "\", \"time\" : \"" + element.time +
                "\"}";
            output_data += data;
            nb_elem++;
        }
        output_data += "]"
        res.append("Access-Control-Allow-Origin", "*").status(200).send(output_data);
    });




}

module.exports = request;
