var express = require('express');
app = express();


//initiation of socket instance
let http = require('http').createServer(app);
let io = require('socket.io')(http);

const req = require('request');
const ejs = require('ejs');
const passport = require('passport');
require('../spsf_service/passport')(passport);
var port = process.env.PORT || 3000;   
var spsfServiceUrl = 'https://spsfservice.us-south.cf.appdomain.cloud';
//var spsfServiceUrl = 'http://localhost:8080';

app.use(express.static(__dirname +'/public'));
//use express boady parser to get view data
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

var loggedIn=false;
var loggedUsername ='';


//establish the socket connection
io.on('connection', (socket) => {
    console.log('A user has connected');

    //initiate the map
    socket.emit('initiate_map', 'Map has been initiated')

    //update parking data every 2 mintues
    setInterval(()=>{
      socket.emit('update_map', 'Map hasbeen updated with recent available parking data')
    }, 120000);

    //disconnect the socket
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });  
});



//spsf index page to sign in (landing or the signin page)
app.get('/',function(request,response){
    if(loggedIn){
        response.render('displayDashboard', {title: 'SPSF - Dashboard',username:loggedUsername,loggedIn:loggedIn, signIn:false});

    }else{
        response.render('index', {title: 'SPSF - Home', username:loggedUsername,password:'',message:'',loggedIn:loggedIn, signIn:false});
    }    
})

// sign in page after user attempt to sign - process form data
app.post('/',
    function(request,response){
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true,
          })
 
    reqObject = spsfServiceUrl+"/authenticate?username="+request.body.Username+"&password="+request.body.Password;
    req(reqObject,(err,result,body)=> {
        if(err){
            return console.log(err);
        }
       
        if(JSON.parse(result.body).authorisation==='true'){
            console.log(request.isAuth);
            loggedIn=true;
            loggedUsername = request.body.Username;
            response.render('displayDashboard', {title: 'SPSF - Dashboard',username:loggedUsername,loggedIn:loggedIn, signIn:false});
        }else{
            let message=JSON.parse(result.body).message;
            response.render('index', {title: 'SPSF - Home',username:loggedUsername,password:'',message:message,loggedIn:loggedIn, signIn:false});
        }              
    });
})

// get registration form when user try to register
app.get('/displayRegister',function(request,response){
    if(loggedIn){
        response.render('displayDashboard', {title: 'SPSF - Dashboard',username:loggedUsername,loggedIn:loggedIn, signIn:false});

    }else{
        response.render('displayRegister', {title: 'SPSF - Registration', username:loggedUsername,email:'',password:'',confirmpassword:'',message:'',loggedIn:loggedIn, signIn:true});
    }
})

// process register form post data to register and send data to service for registration process
app.post('/displayRegister',function(request,response){

    reqObject = spsfServiceUrl+"/register?username="+request.body.Username+"&password="+request.body.Password+"&email="+request.body.Email+"&confirmpassword="+request.body.ConfirmPassword;
    req(reqObject,(err,result,body)=> {
        if(err){
            return console.log(err);
        }

        if(JSON.parse(result.body).registration ==='true'){
            response.render('index', {title: 'SPSF - Home', username:loggedUsername,password:'',message:'',loggedIn:loggedIn, signIn:false});
        }else{
            let message= JSON.parse(result.body).message;
            response.render('displayRegister', {title: 'SPSF - Registration', username:loggedUsername,email:'',password:'',confirmpassword:'',message:message,loggedIn:loggedIn, signIn:true});
        }              
    });
})

// get forget password page to recover password
app.get('/displaySendPassword',function(request,response){
    if(loggedIn){
        response.render('displayDashboard', {title: 'SPSF - Dashboard',username:loggedUsername,loggedIn:loggedIn, signIn:false});

    }else{
        response.render('displaySendPassword', {title: 'SPSF - Forgot Password', username:loggedUsername,email:'',message:'',loggedIn:loggedIn, signIn:true});
    }false
})

// process password recovery from posted data and ask service to send the recovery email
app.post('/displaySendPassword',function(request,response){

    reqObject = spsfServiceUrl+"/sendpassword?email="+request.body.Email;
    req(reqObject,(err,result,body)=> {
        if(err){
            return console.log(err);
        }

        if(JSON.parse(result.body).registration ==='true'){
            response.render('index', {title: 'SPSF - Home', username:loggedUsername,password:'',message:'',loggedIn:loggedIn, signIn:false});
        }else{
            let message= JSON.parse(result.body).message;
            response.render('displaySendPassword', {title: 'SPSF - Forgot Password', username:loggedUsername,email:'',message:message,loggedIn:loggedIn, signIn:true});
        }              
    });
})

// user sign off from the system
app.get('/signoff',function(request,response){
    loggedIn=response.loggedIn;
    loggedUsername = '';
    response.render('index', {title: 'SPSF - Home', username:'',password:'',message:'',loggedIn:loggedIn, signIn:false});
})

//process user dashboard funtionality and route the user to the dessired page
app.post('/displayDashboard',function(request,response){
    if(loggedIn){
        if(request.body.FindParking==='find'){
            response.render('displayParkingMap', {title: 'SPSF - Parking Availability', username:loggedUsername,loggedIn:loggedIn, signIn:false});
        }else if (request.body.FuturePrediction==='prediction'){
            response.render('displayFuturePrediction', {title: 'SPSF - Future Parking Availability', username:loggedUsername,loggedIn:loggedIn, signIn:false});
        }else if(request.body.ChangePassword==='change'){
            response.render('displayChangePassword', {title: 'SPSF - Change Password', username:loggedUsername,oldpassword:'',newpassword:'',confirmpassword:'',message:'',loggedIn:loggedIn, signIn:false});
        }else if(request.body.ParkingHistory==='history'){
            reqObject=spsfServiceUrl+"/getUserHistoryData?username="+loggedUsername;
            req(reqObject,(err,result,body)=>{
                if(err)
                {
                    return console.log(err);
                }
                response.render('displayParkingHistory',{title:"SPSF - Parking History",username:loggedUsername,password:'',message:'',historydata:result.body,loggedIn:loggedIn,signIn:false});
            })

            //response.render('displayParkingHistory', {title: 'SPSF - Parking History', username:loggedUsername,loggedIn:loggedIn, signIn:false});
        }       
    }else{
        response.render('index', {title: 'SPSF - Home', username:loggedUsername,password:'',message:'',loggedIn:loggedIn, signIn:false});
    }   
})

//refresh parking availability map and bac to dash board handling
app.post('/parkingMapRoutesButtonPanel',function(request,response){
    if(loggedIn){
         if (request.body.Dashboard==='dashboard'){
            response.render('displayDashboard', {title: 'SPSF - Dashboard',username:loggedUsername,loggedIn:loggedIn, signIn:false});
            }      
    }else{
        response.render('index', {title: 'SPSF - Home', username:loggedUsername,password:'',message:'',loggedIn:loggedIn, signIn:false});
    }   
})

//once user selected the parking this will route the user to navigation page for navigation
app.post('/parkingMapRoutesMidPanel',function(request,response){

    if(loggedIn){
        if (request.body.Navigate==='navigate'){
                response.render('displayNavigation', {title: 'SPSF - Display Navigation', username:loggedUsername,loggedIn:loggedIn, timer:'', signIn:false, navArray:request.body.NavArray, navArrayIndex: request.body.NavArrayIndex});
            }       
    }else{
        response.render('index', {title: 'SPSF - Home', username:loggedUsername,password:'',message:'',loggedIn:loggedIn, signIn:false});
    }   
})


//get all available parking data from the service
app.get('/getAllAvailableParkingData', function (request,response){

    reqObject = spsfServiceUrl+"/requestAllParkingData";
    req(reqObject,(err,result,body)=> {
        if(err){
            return console.log(err);
        } 
        response.send(result.body);
    })          
})

// get display parking history data
app.get('/displayParkingHistory',function(request,response){
    if(loggedIn)
    {
        reqObject=spsfServiceUrl+"/getUserHistoryData?username="+request.body.Username;
        req(reqObject,(err,result,body)=>{
            if(err)
            {
                return console.log(err);
            }
            response.render('displayParkingHistory',{title:"SPSF - Parking History",username:loggedUsername,password:'',message:'',historydata:result.body,loggedIn:loggedIn,signIn:false});
        })
        
    }
    else
    {
        response.render('index', {title: 'SPSF - Home', username:loggedUsername,password:'',message:'',loggedIn:loggedIn, signIn:false});
    }
})

http.listen(port,()=>{
    console.log('Server is listening on :'+port);
});
