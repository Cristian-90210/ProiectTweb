namespace AtlantisSwim.Domain.Models.User
{
    /// <summary>
    /// Returned by the auth endpoint after a successful login.
    /// Contains the minimal user info the client needs, including
    /// role as both a numeric id (1/2/3) and a human-readable name.
    /// </summary>
    public class UserAuthResponseDto
    {
        public int    Id       { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Email    { get; set; } = string.Empty;

        /// <summary>1 = Student, 2 = Coach, 3 = Admin</summary>
        public int    RoleId   { get; set; }

        /// <summary>Elev | Antrenor | Admin</summary>
        public string RoleName { get; set; } = string.Empty;
    }
}
