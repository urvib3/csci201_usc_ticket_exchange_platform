import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.JsonObject;

@WebServlet("/UserInfo")
public class UserInfo extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    	
    	System.out.println("Attempting to get user info");
    	
        // Retrieve the user_id from the request
        String userId = request.getParameter("user_id");

        // Handle if user_id is not present
        if (userId == null || userId.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"status\": \"error\", \"message\": \"User ID is missing\"}");
            return;
        }

        PrintWriter out = response.getWriter();

        // Call the function to fetch user info from the database
        JsonObject userInfo = getUserInfo(userId);

        // Respond with the user info in JSON format using Gson
        response.setContentType("application/json");
        if (userInfo != null) {
            response.setStatus(HttpServletResponse.SC_OK);
            out.print(userInfo.toString());
        } else {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            out.print("{\"status\": \"error\", \"message\": \"User not found\"}");
        }
        out.flush();
    }

    // Function to get user information from the database using user_id
    protected JsonObject getUserInfo(String userId) {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            // Load the JDBC driver
            Class.forName("com.mysql.cj.jdbc.Driver");
            // Create a connection to the database
            conn = MainDBConnection.getConnection();

            // Query to fetch user info by user_id
            String query = "SELECT fullname, username, university, phone_number, socials FROM users WHERE user_id = ?";
            ps = conn.prepareStatement(query);
            ps.setString(1, userId);
            rs = ps.executeQuery();

            // If the user is found, construct the JSON response using Gson
            if (rs.next()) {
                JsonObject userInfo = new JsonObject();
                userInfo.addProperty("status", "success");
                userInfo.addProperty("user_id", userId);
                userInfo.addProperty("fullname", rs.getString("fullname"));
                userInfo.addProperty("username", rs.getString("username"));
                userInfo.addProperty("university", rs.getString("university"));
                userInfo.addProperty("phone", rs.getString("phone_number"));
                userInfo.addProperty("socials", rs.getString("socials"));
                return userInfo;
            }

        } catch (SQLException | ClassNotFoundException e) {
            e.printStackTrace();
        } finally {
            try {
                if (rs != null) {
                    rs.close();
                }
                if (ps != null) {
                    ps.close();
                }
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }

        // Return null if user is not found
        return null;
    }
}

