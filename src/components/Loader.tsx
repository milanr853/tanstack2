import loader from "../assets/bouncing.svg"

function Loader() {
    return (
        <div className="w-full h-screen flex justify-center items-center">
            <img src={loader} alt="loading..." className="w-[200px] h-[200px]" />
        </div>
    )
}

export default Loader