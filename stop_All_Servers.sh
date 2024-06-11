#!/bin/bash
cd core/customer_Auth
pm2 stop customerAuth.js

cd ../customer_MOP
pm2 stop customerMOP.js

cd ../customer_Transaction
pm2 stop customerTransaction.js

cd ../partner_authTransaction
pm2 stop partnerTransaction.js

cd ../tru_Notification
pm2 stop tru_notification.js

cd ../tru_OTP
pm2 stop truOTP.js

cd ../tru_Rates
pm2 stop truRates.js

cd ../../route/client_server
pm2 stop bin/www --name clientServer

cd ../customer_Router
pm2 stop customerRouter.js

cd ../PGServer
pm2 stop bin/wwwpg

cd ../CDNServer
pm2 stop cdnserver.js

cd ../EmailSMS_server
pm2 stop bin/www --name EmailServer

cd ../SMSServer
pm2 stop smsserver.js

cd ../Notification
pm2 stop notifyServer.js

cd ../zipORpostalcodeServer
pm2 stop zip_postal_server.js

cd ../../admin/adminOTP
pm2 stop truOTPAdmin.js

cd ../tru_Admin_Auth
pm2 stop truAdmin.js

cd ../tru_Admin_Core
pm2 stop truAdminCore.js

cd ../tru_Admin_Router
pm2 stop truAdminRouter.js

cd ../truAdminPartner
pm2 stop truAdminPartner.js

