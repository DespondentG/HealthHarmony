function SendMail(){
    var params= {
        from_name : document.getElementById("fullName").value,
        email_id : document.getElementById("email_id").value,
        message : document.getElementById("message").value,
    }
    emailjs.send("service_bpuhber","template_2g5eowq",params).then(function(res){
        alert("Success!"+res.status);
    })
}