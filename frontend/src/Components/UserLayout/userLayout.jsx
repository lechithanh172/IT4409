import Footer from "../Footer/Footer";
import Header from "../Header/Header";

function userLayout({children}){
    return(
        <div>
            <Header />
            {children}
            <Footer />
        </div>
    )
}
export default userLayout;