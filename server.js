'use strict';
const express=require('express');
const bodyParser=require('body-parser');
const MongoClient = require('mongodb').MongoClient;
let db;

MongoClient.connect('mongodb://localhost/issuetracker').then(connection =>{
    db=connection;    
    app.listen(3000, ()=>{
        console.log('App started on port 3000');
    });    
}).catch(err =>{
    console.log("ERROR: ", err);    
    process.exit(0);
});

const app=express();
app.use('/public', express.static('static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

const validIssueStatus={
    New: true,
    Open: true,
    Assigned: true,
    Fixed: true,
    Verified: true,
    Closed: true
};

const issueFieldType={
    id: 'required',
    status: 'required',
    owner: 'required',
    effort: 'required',
    created: 'required',
    completionDate: 'required',
    title: 'required'
}

function validateIssue(issue){
    for(let field in issueFieldType){
        let type = issueFieldType[field];
        if(!type)
            delete issue[field];
        else if(type==='required' && !issue[field])
            return field+" is required";
    }
    if(!validIssueStatus[issue.status])
        return issue.status+" is not a valid status.";
        
    return null;
}

app.post('/api/issues', function(req, res){
    const newIssue=req.body;    
    newIssue.id=issues.length+1;
    newIssue.created=new Date();
    if(!newIssue.status)
        newIssue.status="New";

    const err=validateIssue(newIssue);
    if(err){
        res.status(422).json({message: "Invalid request: "+err});
        return;
    }
    issues.push(newIssue);
    res.json(newIssue);
});

app.get('/api/issues', (req, res) => {
    db.collection('issues').find().toArray().then(issues => {
        const metadata={total_count: issues.length};
        res.json({_metadata: metadata, records: issues});
    }).catch(err => {
        console.log(err);
        res.status(500).json({message: "Internal Server Error "+err})
    });
});