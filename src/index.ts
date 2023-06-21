import "reflect-metadata"
import { DataSource } from "typeorm";
import express, { Express } from "express";
import dotenv from "dotenv";
import UserController from "./controllers/user.controller";
import CourseController from './controllers/course.controller'
import TutorController from './controllers/tutor.controller'
import { errorHandler } from "./middleware/error.middleware";
import cors from 'cors';


const app: Express = express();

dotenv.config()

app.use(cors());
app.use(express.json());

app.use("/api/v1/user", UserController);
app.use('/api/v1/course', CourseController);
app.use('/api/v1/tutor', TutorController);


//Error Handling Middleware
app.use(errorHandler)


export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "online_quran_acadmey",
    synchronize: true,
    logging: true,
    entities: ["src/entities/*{.ts,.js}"]
});


AppDataSource.initialize().then(() => {
    console.log("Database Connected");

    app.listen(process.env.PORT, () => {
        console.log(`Server Starting on the Port ${process.env.PORT}`)
    })
}).catch((err) => {
    console.log(err)
})



