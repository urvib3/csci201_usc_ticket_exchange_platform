import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/editTicket")
public class editTicket extends HttpServlet {

    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        
        System.out.println("Updating ticket..."); 
        
        try {
            // Retrieve form parameters
        	int ticketID = Integer.parseInt(request.getParameter("ticketID"));
            String eventName = request.getParameter("eventName");
            int startDate = Integer.parseInt(request.getParameter("startDate"));
            int endDate = Integer.parseInt(request.getParameter("endDate"));
            float ticketPrice = Float.parseFloat(request.getParameter("ticketPrice"));
            String additionalInfo = request.getParameter("additionalInfo");
            boolean negotiable = request.getParameter("negotiable") != null; // Checkbox returns null if unchecked
            int numTickets = Integer.parseInt(request.getParameter("numTickets"));
            

            Connection conn = MainDBConnection.getConnection();
            
            // Update SQL query
            String sql = "UPDATE tickets SET eventName = ?, startDate = ?, endDate = ?, ticketPrice = ?, additionalInfo = ?, negotiable = ?, numTickets = ?"
                       + " WHERE ticketID = ?";

            // Prepare the statement
            PreparedStatement ps = conn.prepareStatement(sql);

            // Set the parameters
            ps.setString(1, eventName);
            ps.setInt(2, startDate);
            ps.setInt(3, endDate);
            ps.setFloat(4, ticketPrice);
            ps.setString(5, additionalInfo);
            ps.setBoolean(6, negotiable);
            ps.setInt(7, numTickets);
            ps.setInt(8, ticketID); // Use ticketID to identify the ticket to update
            
            System.out.println("ps: " + ps.toString()); 

            int rowsAffected = ps.executeUpdate();

            if (rowsAffected > 0) {
                response.setStatus(HttpServletResponse.SC_OK);
                out.println("{\"message\": \"Ticket updated successfully\"}");
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