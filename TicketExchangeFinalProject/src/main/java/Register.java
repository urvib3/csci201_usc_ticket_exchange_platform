import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/Register")
public class Register extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Retrieve user input from the request
        String fullname = request.getParameter("name");
        String username = request.getParameter("username");
        String password = request.getParameter("password");
        String university = request.getParameter("university");
        String phoneNumber = request.getParameter("phone");
        String socials = request.getParameter("socials");
        
        System.out.println("hashed pass " + password); 

        PrintWriter out = response.getWriter();
        
        System.out.println("Attempting to register..."); 

        // Call the registerUser function to attempt registration
        boolean registered = registerUser(fullname, username, password, university, phoneNumber, socials, out);
        
        System.out.println("Registration successful: " + registered);

        // Respond with status based on registration result
        if (registered) {
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }
    }

    // Function to register a user
    protected boolean registerUser(String fullname, String username, String password, String university, String phoneNumber, String socials, PrintWriter out) {
        Connection conn = null;
        PreparedStatement ps = null;

        try {
            // Load the JDBC driver
            Class.forName("com.mysql.cj.jdbc.Driver");
            // Create a connection to the database
            conn = MainDBConnection.getConnection();

            // Check if the username already exists
            String checkQuery = "SELECT username FROM users WHERE username = ?";
            ps = conn.prepareStatement(checkQuery);
            ps.setString(1, username);
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                // Username already exists
                out.println("Username already taken");
                return false;
            }

            // Insert the new user into the database
            String insertQuery = "INSERT INTO users (username, fullname, password, university, phone_number, socials) VALUES (?, ?, ?, ?, ?, ?)";
            ps = conn.prepareStatement(insertQuery);
            ps.setString(1, username);
            ps.setString(2, fullname);
            ps.setString(3, password); // Store password in plain text (hashing recommended in production)
            ps.setString(4, university);
            ps.setString(5, phoneNumber);
            ps.setString(6, socials);

            int rowsAffected = ps.executeUpdate();

            // If registration is successful, rowsAffected should be 1
            return rowsAffected > 0;

        } catch (SQLException sqle) {
            sqle.printStackTrace();
            return false;
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
            return false;
        } finally {
            try {
                if (ps != null) {
                    ps.close();
                }
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException sqle) {
                sqle.printStackTrace();
            }
        }
    }
}

