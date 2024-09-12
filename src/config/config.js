import 'dotenv/config';
import fastifySession from '@fastify/session';
import ConnectMongoDBSession from 'connect-mongodb-session';
import{Admin} from '../models/index.js';


const MongoDBStore = ConnectMongoDBSession(fastifySession)

export const sessionStore = new MongoDBStore({
    uri:process.env.MONGO_URI,
    collection: 'session'
})

sessionStore.on("error", (error)=>{
    console.log("session store error", error);
})

export const authenticate = async(email,password)=>{
    if(email=='adilyassar9898@gmail.com' && password == 'adilyassar98A'){
        return Promise.resolve({email:email, password:password})
    }else{
        return null;

    }
}

export const PORT = process.env.PORT || 3000;
export const COOKIE_PASSWORD= process.env.COOKIE_PASSWORD;