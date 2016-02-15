using System.Web.Mvc;

namespace MVC.Web.Controllers
{
    public class AppController : Controller
    {
        public ActionResult AskQuestion()
        {
            return View();
        }
    }
}