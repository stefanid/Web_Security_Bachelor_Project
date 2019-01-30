class UserDTO{
    constructor(user){
        if(user){
                this.userNo = user.userNo,
                this.name = user.name,
                this.address = user.address,
                this.phone = user.phone,
                this.email = user.email,
                this.userName = user.userName,
                this.password = user.password,
                this.passwordSalt = user.passwordSalt,
                this.image = user.image,
                this.roleName = user.roleName
            
        }
    }
}

module.exports = UserDTO;


