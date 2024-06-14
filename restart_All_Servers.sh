#!/bin/bash
cd core/customer_Auth
pm2 restart customerAuth.js

cd ../customer_MOP
pm2 restart customerMOP.js

cd ../customer_Transaction
pm2 restart customerTransaction.js

cd ../partner_authTransaction
pm2 restart partnerTransaction.js

cd ../tru_Notification
pm2 restart tru_notification.js

cd ../tru_OTP
pm2 restart truOTP.js

cd ../tru_Rates
pm2 restart truRates.js

cd ../../route/client_server
pm2 restart bin/www --name clientServer

cd ../customer_Router
pm2 restart customerRouter.js

cd ../PGServer
pm2 restart bin/wwwpg

cd ../CDNServer
pm2 restart cdnserver.js

cd ../EmailSMS_server
pm2 restart bin/www --name EmailServer

cd ../SMSServer
pm2 restart smsserver.js

cd ../Notification
pm2 restart notifyServer.js

cd ../zipORpostalcodeServer
pm2 restart zip_postal_server.js

cd ../../admin/adminOTP
pm2 restart truOTPAdmin.js

cd ../tru_Admin_Auth
pm2 restart truAdmin.js

cd ../tru_Admin_Core
pm2 restart truAdminCore.js

cd ../tru_Admin_Router
pm2 restart truAdminRouter.js

cd ../truAdminPartner
pm2 restart truAdminPartner.js

cd ../adminDash
pm2 restart app.js