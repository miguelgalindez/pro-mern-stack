let contentNode = document.getElementById("contents");

const issues = [
    {
        id: 1, status: 'Open', owner: 'Ravan',
        created: new Date('2016-08-15'), effort: 5, completionDate: undefined,
        title: 'Error in console when clicking Add'
    },
    {
        id: 2, status: 'Assigned', owner: 'Eddie',
        created: new Date('2016-08-16'), effort: 14,
        completionDate: new Date('2016-08-30'),
        title: 'Missing bottom border on panel',
    },
];

class IssueFilter extends React.Component{
    render(){
        return (
            <div>This is a placeholder fot the Issue Filter</div>
        )
    }
}

class IssueRow extends React.Component{
    render(){
        const issue=this.props.issue;
        return (
            <tr>
                <td>{issue._id}</td>
                <td>{issue.status}</td>
                <td>{issue.owner}</td>
                <td>{issue.created.toDateString()}</td>
                <td>{issue.effort}</td>
                <td>{issue.completionDate ? issue.completionDate.toDateString() : ''}</td>
                <td>{issue.title}</td>
            </tr>
        )
    }
}

class IssueTable extends React.Component{
    render(){
        const borderedStyle={border: "1px solid silver", padding: 6};
        const issuesRows=this.props.issues.map(function(issue){
            return <IssueRow key={issue._id} issue={issue} />;
        });
        return (
            <table className="bordered-table">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Status</th>
                        <th>Owner</th>
                        <th>Created</th>
                        <th>Effort</th>
                        <th>Completion Date</th>
                        <th>Title</th>
                    </tr>
                </thead>
                <tbody>{issuesRows}</tbody>
            </table>
        );
    }
}

class IssueAdd extends React.Component{
    constructor(){
        super();
        this.handleSubmit=this.handleSubmit.bind(this);
    }

    handleSubmit(e){
        e.preventDefault();
        let form=document.forms.issueAdd;
        this.props.createIssue({
            owner: form.owner.value,
            title: form.title.value,
            status: 'New',
            created: new Date()
        });
        form.owner.value="";
        form.title.value="";
    }

    render(){
        return (
            <div>
                <form name="issueAdd" onSubmit={this.handleSubmit}>
                    <input type="text" name="owner" placeholder="Owner"/>
                    <input type="text" name="title" placeholder="Title"/>
                    <button>Add</button>
                </form>
            </div>
        )
    }
}

class IssueList extends React.Component{
    constructor(){
        super();
        this.state ={issues: []};
        /* Creating a bounded function for making the future calls easier
            (There won't needed to add bind(this) every time that it's called)
        */
        this.createTestIssue=this.createTestIssue.bind(this);
        this.createIssue=this.createIssue.bind(this);
        //setTimeout(this.createTestIssue, 2000);        
    }

    componentDidMount(){
        this.loadData();
    }

    loadData(){
        /*
            Note that we don't have to bind loadData to "this", because
            we used an arrow function, which uses the lexical "this". So
            the "this" variable is initialized to the component instance.
        
        setTimeout(()=>{
            this.setState({issues: issues});
        }, 500);
        */

        fetch('/api/issues')
            .then(response => {
                if(response.ok){
                    response.json().then(data =>{
                        console.log("Total acount of records ",data._metadata.total_count);
                        data.records.forEach(issue => {
                            issue.created=new Data();                            
                            issue.completionDate=issue.completionDate ? new Date(issue.completionDate) : null;
                        });
                        this.setState(data.records);
                    });
                }
                else{
                    response.json().then(err => {
                        alert("Failed to fetch issues: "+err.message);
                    });
                }                        
            }).catch(err => {
                alert("Error in fetching data from server:", err);
            });
    }

    createIssue(newIssue){
        fetch('/api/issues', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(newIssue)
        }).then(response => {
            if(response.ok){
                response.json().then(updatedIssue => {
                    updatedIssue.created=new Date(updatedIssue.created);
                    if(updatedIssue.completionDate)
                        updatedIssue.completionDate=new Date(updatedIssue.completionDate);
                    const newIssues=this.state.issues.concat(updatedIssue);
                    this.setState({issues: newIssues});
                });
            }
            else
                response.json().then(err => alert("Failed to add issue: "+err.message));
        })
        .catch(err => {
            alert("Error in sending data to server "+err.message);
        });      
    }

    createTestIssue(){
        this.createIssue({
            status: 'New', owner: 'Pieta', created: new Date(),
            title: 'Completion date should be optional'
        });
    }

    render(){        
        return (
            <div>
                <h1>Issue Tracker</h1>
                <IssueFilter/>
                <hr/>
                <IssueTable issues={this.state.issues} />                
                <hr/>
                <IssueAdd createIssue={this.createIssue} />
            </div>
        )
    }
}

ReactDOM.render(<IssueList />, contentNode)