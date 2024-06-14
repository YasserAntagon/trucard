#!/bin/bash
cd core/customer_Auth
pm2 start customerAuth.js

cd ../customer_MOP
pm2 start customerMOP.js

cd ../customer_Transaction
pm2 start customerTransaction.js

cd ../partner_authTransaction
pm2 start partnerTransaction.js

cd ../tru_Notification
pm2 start tru_notification.js

cd ../tru_OTP
pm2 start truOTP.js

cd ../tru_Rates
pm2 start truRates.js

cd ../../route/client_server
pm2 start bin/www --name clientServer

cd ../customer_Router
pm2 start customerRouter.js

cd ../PGServer
pm2 start bin/wwwpg

cd ../CDNServer
pm2 start cdnserver.js

cd ../EmailSMS_server
pm2 start bin/www --name EmailServer

cd ../SMSServer
pm2 start smsserver.js

cd ../Notification
pm2 start notifyServer.js

cd ../zipORpostalcodeServer
pm2 start zip_postal_server.js

cd ../../admin/adminOTP
pm2 start truOTPAdmin.js

cd ../tru_Admin_Auth
pm2 start truAdmin.js

cd ../tru_Admin_Core
pm2 start truAdminCore.js

cd ../tru_Admin_Router
pm2 start truAdminRouter.js

cd ../truAdminPartner
pm2 start truAdminPartner.js

cd ../../adminDash
npm start app.js

