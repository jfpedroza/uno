import * as express from "express";
import * as http from "http";
import * as socketio from "socket.io";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const app = express();
const server = new http.Server(app);
const io = socketio(server);

app.set("port", process.env.PORT || 3000);

app.use(express.static(path.join(__dirname, "public")/*, { maxAge: 31557600000 }*/));

server.listen(app.get("port"), function() {
    console.log("Server running at http://localhost:" + app.get("port"));
});