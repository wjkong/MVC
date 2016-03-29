using System.Diagnostics;
using System.Web.Mvc;

namespace MVC.Web.Controllers
{
    public class AppController : Controller
    {
        [ActionName("Ask-Question-Stack-Exchange")]
        public ActionResult AskQuestion()
        {
            return View();
        }

        [ActionName("Indeed-Job-Search")]
        public ActionResult JobSearch()
        {
            Debug.WriteLine("Hello world");

            return View();
        }
    }
}