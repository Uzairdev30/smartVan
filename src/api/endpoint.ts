const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const AUTH = {
    SUPERAMIN_LOGIN: `${BASE_URL}/Admin/login`,
    SCHOOL_ADMIN: `${BASE_URL}/Admin/login`,
    FORGET_PASSWORD: `${BASE_URL}/Admin/forgot-password`,
    RESET_PASSWORD: `${BASE_URL}/Admin/reset-password`,
    RESEND_OTP: `${BASE_URL}/Admin/resend-otp`,
    GET_PROFILE:`${BASE_URL}/Admin/getProfile`,
    CHANGE_PASSWORD:`${BASE_URL}/Admin/changePassword`
};

export const STUDENT = {
    GET_ALL_STUDENTS: '/Admin/Get-Students',
    CREATE_STUDENT: '/Admin/addStudent',
    DELETE_STUDENT: '/Admin/removeStudents',
    GET_STUDENT_BY_ID: '/Admin/getStudentById',
    ASSIGN_VAN: '/Admin/assignVanToStudent',
    VERIFY_STUDENT_BY_ADMIN: '/kid/changeKidStatus',
    ASSIGN_VAN_TO_STUDENT: '/kid/assignVanToStudents',
    REMOVE_VAN_TO_STUDENT: 'kid/removeVanFromKid',
}
export const SCHOOL = {
    GET_ALL_SCHOOL: '/Admin/getAllSchools'
}
export const DRIVER = {
    GET_ALL_DRIVER: '/school/getDriversProfile',
    GET_ALL_DRIVER_OF_SCHOOL: `${BASE_URL}/school/getDriversProfile`,
    ASSIGN_DRIVER_TO_VAN: `${BASE_URL}/Admin/assignVanToDriver`,
    REMOVE_DRIVER: `${BASE_URL}/van/removeDriverFromVan`,
    GET_DRIVER: `${BASE_URL}/van/GetAllDriversByAdmin`,
    CHANGE_DRIVER_STATUS: `${BASE_URL}/van/changeDriverStatus`,
    GET_DRIVER_BY_ID: `${BASE_URL}/van/getDriverById/`,
    REMOVE_DRIVER_FROM_SCHOOL: `${BASE_URL}/van/removeDriversFromScool`

}
export const VAN = {
    GET_ALL_VANS: '/school/',
    GET_ALL_VAN_OF_SCHOOL: `/van/GetVansByAdmin`,
    GET_VAN_BY_ID: '/van/getVanById',
    ADD_VAN: `${BASE_URL}/van/addVanByAdmin`,
    UPDATE_VAN: `${BASE_URL}/van/editVanByAdmin`,
    CHANGE_STATUS: `${BASE_URL}/van/changeVanStatus`,
    DELETE_VAN: `${BASE_URL}/van/deleteVanByAdmin`,
    REMOVE_DRIVER: `${BASE_URL}/van/removeDriverFromVan`
}
export const COMPLAINT = {
    GET_ALL_COMPLAINT: 'report/getComplainsByAdmin',
    GET_COMPLAINT_BY_ID: 'report/getComplaintById',
    CHANGE_STATUS: 'report/changeComplaintStatus'
}
export const ALERT = {
    GET_ALL_ALERTS: '/alert/getAlert',
    GET_ALERT_BY_ID: '/alert/getAlertById',
    UPDATE_ALERT: '/alert/editAlert',
    DELETE_ALERT: '/alert/deleteAlert',
    ADD_ALERT: '/alert/addAlert'
}
export const ROUTE = {
    GET_ALL_ROUTE: 'Route/getRoutes',
    CREATE_ROUTE:'Route/createRoute',
    GET_ROUTE_BY_ID: '/Route/getRouteById',
    UPDATE_ROUTE: 'Route/editRoute',
    DELETE_ROUTE: `${BASE_URL}/Route/deleteRouteByAdmin`,

}
export const SUADMIN={
    REGISTER_SCHOOL:'/Admin/create-admin-school',
    SCHOOL_BY_ID:'/Admin/getSchoolById',
    EDIT_SCHOOL:'/Admin/edit-admin-school' ,
    GET_ALL_SCHOOL:'/Admin/getAllSchools',
    CHANGE_SCHOOL_STATUS:'/school/changeSchoolStatus',
    
    // billing
    CREATE_BILLING:'/Invoice/createInvoice',
    GET_ALL_INVOICE:'/Invoice/getAllInvoicesBySuperAdmin',

    // banner
    CREATE_BANNER:'/promotion-banner',
    GET_ALL_BANNERS:'/promotion-banner/findAll',
    GET_BANNER_BY_ID:'/promotion-banner',
    UPDATE_BANNER:'/promotion-banner',
    DELETE_BANNER:'/promotion-banner',
    
    //driver 
    GET_ALL_DRIVER_FOR_SUPERADMIN: `${BASE_URL}/admin/getAllDriversForSuperAdmin`,
    GET_DRIVER_DETAIL_SUPERADMIN: `${BASE_URL}/van/getDriverById`,

    //vans
    GET_ALL_VAN_FOR_SUPERADMIN: `${BASE_URL}/admin/GetVansBySuperAdmin`
}

export const DASHBOARD ={
    GET_DASHBOARD_STATS:'/trips/getDashboard'
}

export const TRIP ={
    GET_ALL_TRIP:'/trips/Get-Trips-By-Admin',
    GET_ALL_TRIP_KIDS:'/van/getKidsByDriver'
    
}