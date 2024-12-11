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

@WebServlet("/AddFavoriteTicket")
public class AddFavoriteTicket extends HttpServlet {

    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        System.out.println("Processing add to favorites");

        try {
            // Retrieve form parameters
            int userID = Integer.parseInt(request.getParameter("userID"));
            int ticketID = Integer.parseInt(request.getParameter("ticketID"));

            // Check if the favorite already exists
            if (isFavoriteExists(userID, ticketID)) {
                response.setStatus(HttpServletResponse.SC_OK); // No conflict, already exists
                out.println("{\"message\": \"This ticket is already in your favorites.\"}");
                return; // Early exit if already a favorite
            }

            // Proceed to insert the new favorite
            Connection conn = MainDBConnection.getConnection();
            String sql = "INSERT INTO favorites (user_id, ticket_id) VALUES (?, ?)";
            PreparedStatement ps = conn.prepareStatement(sql);

            ps.setInt(1, userID);
            ps.setInt(2, ticketID);

            int rowsAffected = ps.executeUpdate();

            if (rowsAffected > 0) {
                response.setStatus(HttpServletResponse.SC_OK);
                out.println("{\"message\": \"Ticket added to favorites successfully.\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.println("{\"message\": \"Failed to add the ticket to favorites.\"}");
            }

            ps.close();
            conn.close();

            System.out.println("Ticket added to favorites successfully");

        } catch (SQLException | NumberFormatException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.println("{\"message\": \"Error: " + e.getMessage() + "\"}");
        }
    }

    // Helper function to check if the ticket is already in the user's favorites
    private boolean isFavoriteExists(int userID, int ticketID) throws SQLException {
        String checkSQL = "SELECT COUNT(*) FROM favorites WHERE user_id = ? AND ticket_id = ?";
        try (Connection conn = MainDBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(checkSQL)) {

            ps.setInt(1, userID);
            ps.setInt(2, ticketID);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0; // If count > 0, the favorite exists
                }
            }
        }
        return false; // No favorite exists
    }
}

