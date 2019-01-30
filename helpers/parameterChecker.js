var parameterChecker = {}; 
 
parameterChecker.check = function(req, params){ 
    for (let i = 0; i < params.length; i++) { 
        if(params[i] === undefined){ 
            params[i] = null;          
        } else { 
            params[i] = req.sanitize(params[i]); 
        } 
    } 
    return params; 
    
} 
module.exports = parameterChecker;