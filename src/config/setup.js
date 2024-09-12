import AdminJS from "adminjs";
import AdminJSFastify from "@adminjs/fastify";
import * as AdminJSMoongoose from '@adminjs/mongoose'
import * as models from '../models/index.js'
import { Store } from "@fastify/session";
import { authenticate, COOKIE_PASSWORD, sessionStore } from "./config.js";

AdminJS.registerAdapter(AdminJSMoongoose)

export const admin = new AdminJS({
    resources:[
        {
        resource:models.Customer,
        options:{
            listProperties:["phone","role", "isActivated"],
            filterProperties:["phone","role"]
        }
        },
        {
            resource:models.DeliveryPartner,
            options:{
                listProperties:["email","role", "isActivated"],
                filterProperties:["email","role"]
            }
            },
            {
                resource:models.Admin,
                options:{
                    listProperties:["email","role", "isActivated"],
                    filterProperties:["email","role"]
                }
                },
                {
                    resource:models.Branch,
                  
                    }
    ],
    branding:{
        companyName: "easykit",
        withMadeWithLove:false,
    },
    rootPath:"/admin",
});

export const buildAdminRouter = async(app)=>{
    await AdminJSFastify.buildAuthenticatedRouter(
        admin, {
            authenticate,
            cookiePassword: COOKIE_PASSWORD,
            cookieName:"adminjs"
        } ,
         app, {
        store: sessionStore,
        saveUnIntialized : true,
        secret: COOKIE_PASSWORD,
        cookie:{
            httpOnly:process.env.NODE_ENV ==="production",
            secure:process.env.NODE_ENV ==="production",
        }
        },
    )
}