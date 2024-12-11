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

@WebServlet("/DeleteFavoriteTicket")
public class DeleteFavoriteTicket extends HttpServlet {

    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        System.out.println("Processing delete from favorites");

        try {
            // Retrieve form parameters
            int userID = Integer.parseInt(request.getParameter("userID"));
            int ticketID = Integer.parseInt(request.getParameter("ticketID"));

            // Proceed to delete the favorite
            Connection conn = MainDBConnection.getConnection();
            String sql = "DELETE FROM favorites WHERE user_id = ? AND ticket_id = ?";
            PreparedStatement ps = conn.prepareStatement(sql);

            ps.setInt(1, userID);
            ps.setInt(2, ticketID);

            int rowsAffected = ps.executeUpdate();

            if (rowsAffected > 0) {
                response.setStatus(HttpServletResponse.SC_OK);
                out.println("{\"message\": \"Ticket removed from favorites successfully.\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.println("{\"message\": \"Favorite not found.\"}");
            }

            ps.close();
            conn.close();

            System.out.println("Ticket removed from favorites successfully");

        } catch (SQLException | NumberFormatException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.println("{\"message\": \"Error: " + e.getMessage() + "\"}");
        }
    }
}

