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

@WebServlet("/HandlePurchase")
public class HandlePurchase extends HttpServlet {

    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        System.out.println("Processing purchase acceptance");

        try {
            // Retrieve parameters from the URL
            int ticketID = Integer.parseInt(request.getParameter("ticketID"));
            int buyerID = Integer.parseInt(request.getParameter("buyerID"));
            int sellerID = Integer.parseInt(request.getParameter("sellerID"));
            int status = Integer.parseInt(request.getParameter("status"));
            
            System.out.println("ticketID: " + ticketID + " buyerID: " + buyerID + " sellerID: " + sellerID); 

            // Proceed to remove the offer from the offers table
            Connection conn = MainDBConnection.getConnection();

            // First, remove the offer from the offers table
            String deleteSQL = "DELETE FROM offers WHERE ticket_id = ? AND buyer_id = ? AND seller_id = ?";
            PreparedStatement psDelete = conn.prepareStatement(deleteSQL);
            psDelete.setInt(1, ticketID);
            psDelete.setInt(2, buyerID);
            psDelete.setInt(3, sellerID);

            int rowsAffected = psDelete.executeUpdate();

            // If no offer was found, send a conflict status
            if (rowsAffected == 0) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND); // 404 Not Found
                out.println("{\"message\": \"No matching offer found to accept.\"}");
                return;
            }
             
            if(status == 1) { // no need to update if it was rejected
	            // Update the ticket status to 1 (e.g., "Sold" or "Purchased") if accepted
	            String updateTicketStatusSQL = "UPDATE tickets SET status = 1 WHERE ticketID = ?";
	            PreparedStatement psUpdateTicketStatus = conn.prepareStatement(updateTicketStatusSQL);
	            psUpdateTicketStatus.setInt(1, ticketID);
	
	            rowsAffected = psUpdateTicketStatus.executeUpdate();
	
	
	            // If no ticket was found, send a conflict status
	            if (rowsAffected == 0) {
	                response.setStatus(HttpServletResponse.SC_NOT_FOUND); // 404 Not Found
	                out.println("{\"message\": \"No matching ticket found.\"}");
	                return;
	            }
            
            }


            // Insert into the pastoffers table to mark the offer as accepted
            String insertSQL = "INSERT INTO pastoffers (ticket_id, buyer_id, seller_id, status) VALUES (?, ?, ?, ?)";
            PreparedStatement psInsert = conn.prepareStatement(insertSQL);
            psInsert.setInt(1, ticketID);
            psInsert.setInt(2, buyerID);
            psInsert.setInt(3, sellerID);
            psInsert.setString(4, (status == 0) ? "rejected" : "approved"); // Status as "approved"

            int insertRowsAffected = psInsert.executeUpdate();

            if (insertRowsAffected > 0) {
                response.setStatus(HttpServletResponse.SC_OK); // 200 OK
                out.println("{\"message\": \"Purchase offer accepted and added to pastoffers.\"}");
                System.out.println("Purchase offer accepted successfully");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR); // 500 Internal Server Error
                out.println("{\"message\": \"Failed to add the offer to pastoffers.\"}");
            }

            // Close the PreparedStatements and the connection
            psDelete.close();
            psInsert.close();
            conn.close();


        } catch (SQLException | NumberFormatException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST); // 400 Bad Request
            out.println("{\"message\": \"Error: " + e.getMessage() + "\"}");
        }
    }
}

