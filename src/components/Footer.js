import '../styles/footer.css';

export default function Footer() {
    return (
        <footer>
            <h1 className="footer-h1">RMIT STEM Advisor</h1>
            <div className="footer-links">
                <div><a href="https://www.rmit.edu.au/">RMIT Website</a></div>
                <div><a href="https://www.rmit.edu.au/students/my-course/canvas">Canvas</a></div>
                <div><a href="https://www.rmit.edu.au/students/support-services/student-connect">Student Connect</a></div>
                <div><a href="https://www.rmit.edu.au/students/my-course/program-course-information/course-guides">Course Guide</a></div>
            </div>
            <p id="footer-copyright">By Jose Ortega | Copyright © 2025 RMIT University</p>
        </footer>
    )
}