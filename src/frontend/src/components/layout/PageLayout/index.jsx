import "./styles.css";
import Header from "../Header";
import Banner from "../../ui/Banner";
import Footer from "../Footer";

export default function PageLayout({
  children,
  bannerTitle,
  bannerSubtitle,
  bannerVariant = "blue",
  bannerBackgroundImage,
  bannerSideImage,
  showBanner = true,
  contentClassName = "",
  innerClassName = "",
}) {
  return (
    <main className="page-container">
      <Header />

      {showBanner && (
        <Banner
          backgroundImage={bannerBackgroundImage}
          sideImage={bannerSideImage}
          title={bannerTitle}
          subtitle={bannerSubtitle}
          variant={bannerVariant}
        />
      )}

      <section className={`page-content ${contentClassName}`.trim()}>
        <div className={`page-inner ${innerClassName}`.trim()}>{children}</div>
      </section>

      <Footer />
    </main>
  );
}
