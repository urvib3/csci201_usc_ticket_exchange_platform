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

@WebServlet("/BuyTicket")
public class BuyTicket extends HttpServlet {

    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        System.out.println("Processing ticket purchase");

        try {
            // Retrieve form parameters
            int buyerID = Integer.parseInt(request.getParameter("buyerID"));
            int sellerID = Integer.parseInt(request.getParameter("sellerID"));
            int ticketID = Integer.parseInt(request.getParameter("ticketID"));

            // Check for existing offer
            if (isOfferExists(buyerID, sellerID, ticketID)) {
                response.setStatus(HttpServletResponse.SC_CONFLICT); // 409 Conflict
                out.println("{\"message\": \"Offer already exists for this combination of buyer, seller, and ticket.\"}");
                return; // Early exit if duplicate entry found
            }
            
            if(buyerID == sellerID) {
            	response.setStatus(HttpServletResponse.SC_CONFLICT); // 409 Conflict
                out.println("{\"message\": \"Users can not buy their own ticket.\"}");
                return; // Early exit if duplicate entry found
            }

            // Proceed to insert a new offer
            Connection conn = MainDBConnection.getConnection();
            String sql = "INSERT INTO offers (buyer_id, seller_id, ticket_id) VALUES (?, ?, ?)";
            PreparedStatement ps = conn.prepareStatement(sql);

            ps.setInt(1, buyerID);
            ps.setInt(2, sellerID);
            ps.setInt(3, ticketID);

            int rowsAffected = ps.executeUpdate();

            if (rowsAffected > 0) {
                response.setStatus(HttpServletResponse.SC_OK);
                out.println("{\"message\": \"Offer added successfully.\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.println("{\"message\": \"Failed to add the offer.\"}");
            }

            ps.close();
            conn.close();

            System.out.println("Offer added successfully");

        } catch (SQLException | NumberFormatException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.println("{\"message\": \"Error: " + e.getMessage() + "\"}");
        }
    }

    // Helper function to check if the offer already exists in the offers table
    private boolean isOfferExists(int buyerID, int sellerID, int ticketID) throws SQLException {
        String checkSQL = "SELECT COUNT(*) FROM offers WHERE buyer_id = ? AND seller_id = ? AND ticket_id = ?";
        try (Connection conn = MainDBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(checkSQL)) {

            ps.setInt(1, buyerID);
            ps.setInt(2, sellerID);
            ps.setInt(3, ticketID);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0; // If count > 0, the offer exists
                }
            }
        }
        return false; // No offer exists
    }
}

