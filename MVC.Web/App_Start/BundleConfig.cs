using System.Web.Optimization;

namespace MVC.Web
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new StyleBundle("~/Content/CSS").Include(
                   "~/Content/bootstrap.css",
                   "~/Content/bootstrap-theme.css",
                   "~/Content/site.css"));

            bundles.Add(new ScriptBundle("~/bundles/Common").Include(
                     "~/Scripts/modernizr-*",
                     "~/Scripts/jquery-{version}.js",
                     "~/Scripts/bootstrap.js",
                     "~/Scripts/respond.js",
                     "~/Scripts/App/Common.js"));

            bundles.Add(new ScriptBundle("~/bundles/AskQuestion").Include(
                    "~/Scripts/App/StackExchange.js"));

            bundles.Add(new ScriptBundle("~/bundles/JobSearch").Include(
                   "~/Scripts/App/JobSearch.js"));
   

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.validate*"));
                      
        }
    }
}
