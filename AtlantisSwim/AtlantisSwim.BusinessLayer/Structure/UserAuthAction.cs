using AtlantisSwim.BusinessLayer.Core;
using AtlantisSwim.BusinessLayer.Interfaces;
using AtlantisSwim.Domain.Models.Responces;
using AtlantisSwim.Domain.Models.User;

namespace AtlantisSwim.BusinessLayer.Structure
{
    public class UserAuthAction : UserActions, IUserLoginAction
    {
        public UserAuthAction() { }

        public ActionResponce UserLoginDataValidation(UserLoginDto udata)
        {
            var response = new ActionResponce();

            var isValid = UserLoginDataValidationExecution(udata);

            if (isValid)
            {
                var token = UserTokenGeneration(udata);

                response.IsSuccess = true;
                response.Data = token;
                response.Message = "Login successful";
            }
            else
            {
                response.IsSuccess = false;
                response.Message = "Invalid credentials";
            }

            return response;
        }
    }
}
