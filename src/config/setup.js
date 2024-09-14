import AdminJS, { Sidebar } from "adminjs";
import AdminJSFastify from "@adminjs/fastify";
import * as AdminJSMoongoose from '@adminjs/mongoose'
import * as models from '../models/index.js'
import { Store } from "@fastify/session";
import { authenticate, COOKIE_PASSWORD, sessionStore } from "./config.js";
import{dark, light, noSidebar} from '@adminjs/themes';

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
                  
                    },{
                        resource:models.Category
                    },{
                        resource:models.Product
                    }
    ],
    branding:{
        companyName: "easykit",
        withMadeWithLove:false,
        favicon:"https://i.pinimg.com/736x/54/89/10/5489102e76d782aa93ee0768906c1960.jpg",
        
      
    },
    availableThemes:[dark, light, Sidebar],
    defaultTheme: dark.id,
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