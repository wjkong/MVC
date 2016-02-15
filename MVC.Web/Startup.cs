using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(MVC.Web.Startup))]
namespace MVC.Web
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
