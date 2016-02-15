using MVC.Web.Models;
using System.Web.Http;

namespace MVC.Web.Controllers
{
    public class ApiServiceController : ApiController
    {
        [HttpPost]
        [Route("route/search")]
        public IHttpActionResult Search([FromBody]ParamJob user)
        {
            return Ok(true);
        }

        public string Get()
        {
            return "Hi from web api controller";
        }
    }
}
