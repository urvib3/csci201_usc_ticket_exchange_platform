import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

@WebServlet("/UserTicketListings")
public class UserTicketListings extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        // Retrieve the user_id from the request
        String userId = request.getParameter("user_id");
        
        System.out.println("Attempting to get user ticket listings for " + userId);

        // Handle if user_id is not present
        if (userId == null || userId.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"status\": \"error\", \"message\": \"User ID is missing\"}");
            return;
        }

        PrintWriter out = response.getWriter();

        // Call the function to fetch ticket listings for the given user_id
        JsonArray tickets = getUserTickets(userId);

        // Respond with the ticket listings in JSON format
        response.setContentType("application/json");
        if (tickets != null && tickets.size() > 0) {
            response.setStatus(HttpServletResponse.SC_OK);
            out.print(tickets.toString());
            System.out.println("Successful ticket listing extraction: " + tickets.toString());
        } else {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            out.print("{\"status\": \"error\", \"message\": \"No tickets found for the user\"}");
        }
        out.flush();
    }

    // Function to get ticket listings for a specific user_id from the database
    protected JsonArray getUserTickets(String userId) {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        JsonArray ticketsArray = new JsonArray();

        try {
            // Load the JDBC driver
            Class.forName("com.mysql.cj.jdbc.Driver");
            // Create a connection to the database
            conn = MainDBConnection.getConnection();

            System.out.println("Connecting to database"); 
            
            // Query to fetch ticket info by user_id
            String query = "SELECT ticketID, eventName, startDate, endDate, ticketPrice, additionalInfo, negotiable, numTickets, status "
                    + "FROM tickets WHERE user_id = ?";
            ps = conn.prepareStatement(query);
            ps.setString(1, userId);
            rs = ps.executeQuery();
            
            System.out.println("Database query successful");

            // If tickets are found for the user, construct the JSON response
            while (rs.next()) {
                JsonObject ticket = new JsonObject();
                ticket.addProperty("ticketID", rs.getInt("ticketID"));
                ticket.addProperty("eventName", rs.getString("eventName"));
                ticket.addProperty("startDate", rs.getInt("startDate"));  // You may want to convert this to a proper date format
                ticket.addProperty("endDate", rs.getInt("endDate"));
                ticket.addProperty("ticketPrice", rs.getFloat("ticketPrice"));
                ticket.addProperty("additionalInfo", rs.getString("additionalInfo"));
                ticket.addProperty("negotiable", rs.getBoolean("negotiable"));
                ticket.addProperty("numTickets", rs.getInt("numTickets"));
                ticket.addProperty("status", rs.getInt("status"));

                // Add the ticket to the JSON array
                ticketsArray.add(ticket);
            }
            
            System.out.println("Full resultset processed");

        } catch (SQLException | ClassNotFoundException e) {
            e.printStackTrace();
            System.out.println(e); 
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
                System.out.println(e); 
            }
        }

        // Return the JSON array with ticket data
        return ticketsArray;
    }
}
