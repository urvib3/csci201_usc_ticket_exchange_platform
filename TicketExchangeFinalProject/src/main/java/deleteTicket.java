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

@WebServlet("/deleteTicket")
public class deleteTicket extends HttpServlet {

    private static final long serialVersionUID = 1L;

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        
        System.out.println("Deleting ticket..."); 
        
        try {
            // Retrieve form parameters
        	int ticketID = Integer.parseInt(request.getParameter("ticketID"));

            Connection conn = MainDBConnection.getConnection();
            
            // Delete SQL query
            String sql = "DELETE FROM tickets WHERE ticketID = ?";
            
            // Prepare the statement
            PreparedStatement ps = conn.prepareStatement(sql);
            
            // Set the ticketID to the query
            ps.setInt(1, ticketID);
            
            System.out.println("ps: " + ps.toString()); 

            int rowsAffected = ps.executeUpdate();

            if (rowsAffected > 0) {
                response.setStatus(HttpServletResponse.SC_OK);
                out.println("{\"message\": \"Ticket deleted successfully\"}");
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