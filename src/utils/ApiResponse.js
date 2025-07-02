class ApiResponse {
    constructor(statuscode, data , message = "Sucess"){
        this.data=data
        this.statuscode = statuscode
        this.message = message
        this.sucess = statuscode < 400
    }
}

export { ApiResponse }
