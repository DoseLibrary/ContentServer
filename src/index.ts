import { Server } from "./Server";

console.log(`
######                       
#     #  ####   ####  ###### 
#     # #    # #      #      
#     # #    #  ####  #####  
#     # #    #      # #      
#     # #    # #    # #      
######   ####   ####  ######  \n`);

const server = new Server();
server.start(3001);