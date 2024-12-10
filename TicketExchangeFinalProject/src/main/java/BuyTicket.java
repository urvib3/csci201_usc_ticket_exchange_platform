import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/BuyTicket")
public class BuyTicket extends HttpServlet {

    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        System.out.println("Adding ticket"); 
        
        try {
            // Retrieve form parameters
            String eventName = request.getParameter("eventName");
            int userID = Integer.parseInt(request.getParameter("userID"));
            int startDate = Integer.parseInt(request.getParameter("startDate"));
            int endDate = Integer.parseInt(request.getParameter("endDate"));
            float ticketPrice = Float.parseFloat(request.getParameter("ticketPrice"));
            String additionalInfo = request.getParameter("additionalInfo");
            boolean negotiable = request.getParameter("negotiable") != null; // Checkbox returns null if unchecked
            int numTickets = Integer.parseInt(request.getParameter("numTickets"));
            int status = Integer.parseInt(request.getParameter("status"));
            

            Connection conn = MainDBConnection.getConnection();
            String sql = "INSERT INTO tickets (user_id, eventName, startDate, endDate, ticketPrice, additionalInfo, negotiable, numTickets, status) "
                       + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            PreparedStatement ps = conn.prepareStatement(sql);

            ps.setInt(1, userID);
            ps.setString(2, eventName);
            ps.setInt(3, startDate);
            ps.setInt(4, endDate);
            ps.setFloat(5, ticketPrice);
            ps.setString(6, additionalInfo);
            ps.setBoolean(7, negotiable);
            ps.setInt(8, numTickets);
            ps.setInt(9, status);

            int rowsAffected = ps.executeUpdate();

            if (rowsAffected > 0) {
                response.setStatus(HttpServletResponse.SC_OK);
                out.println("{\"message\": \"Ticket added successfully\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.println("{\"message\": \"Failed to save ticket\"}");
            }

            ps.close();
            conn.close();
            
            System.out.println("Successfully added new ticket"); 

        } catch (SQLException | NumberFormatException e) {
        	e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.println("{\"message\": \"Error: " + e.getMessage() + "\"}");
        }
    }
}
