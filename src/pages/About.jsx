import Layout from "../components/Layout";
import facebookLogo from "../images/facebook.svg";
import gmailLogo from "../images/gmail.svg";
import linkedinLogo from "../images/linkedin.svg";

function About() {
  return (
    <>
      <Layout headerContent="About MK Inventory Ledger" pageName="about">
        <div>
          <div className="about-content">
            <p>
              Welcome to MK Inventory Ledger—Momikie's General Merchandise's
              exclusive web-based inventory management system. This system
              allows you to efficiently track and manage your store’s inventory,
              sales, and accounts all in one location, streamlining your daily
              operations and allowing you more time to focus on running and
              expanding your business.
            </p>
            <h3 style={{ marginBottom: "0px" }}>What You Can Do</h3>
            <ul style={{ marginTop: "8px", lineHeight: "2.2" }}>
              <li>
                <b>Dashboard Page –</b> Get a quick overview of your store's performance, including inventory, sales, and recent activities.
              </li>
              <li>
                <b>Products Page –</b> Manage all products in your store, including adding new items, editing details, and deleting products.
              </li>
              <li>
                <b>Stocks Page –</b> Monitor and update your inventory, keeping track of current stock levels and viewing historical stock movements.
              </li>
              <li>
                <b>Sales Page –</b> Keep track of all sales transactions, add new sales, and manage payment statuses.
              </li>
              <li>
                <b>Account Page –</b> Manage user profiles, personal information, andaccess control to ensure secure and efficient operations.
              </li>
            </ul>
          </div>

          <div style={{ marginTop: "50px" }}>
            <b className="content-header" style={{ color: "black", textAlign: "initial", marginLeft: "0px"}}>Contact Developers</b>
            <div className="about-content">
              <p style={{ marginBottom: "5px", marginLeft: "10px" }}>
                For questions or suggestions, you may contact the developers through the following social media.
              </p>
              <hr class="hr_weight"/>
              <div className="social-links">
                <a
                  href="https://www.facebook.com/profile.php?id=61576252538219"
                  aria-label="Visit our Facebook page"
                  title="Visit our Facebook page"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={facebookLogo} alt="Facebook logo" />
                </a>
                <a
                  href="mailto:mk.general.merch@gmail.com"
                  aria-label="Send us an email"
                  title="Send us an email"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={gmailLogo} alt="Email logo" />
                </a>
                <a
                  href="https://www.linkedin.com/in/momiekie-genmerch-61ba09366?trk=contact-info"
                  aria-label="Contact Us on LinkedIn"
                  title="Contact Us on LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={linkedinLogo} alt="LinkedIn" />
                </a>
              </div>
              <hr class="hr_weight"/>
              <footer>
                <p>Inventory Ledger System &copy; {new Date().getFullYear()}™<br />Project in Web System and Information Management</p>

              </footer>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

export default About;
