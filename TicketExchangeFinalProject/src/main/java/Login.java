import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/Login")
public class Login extends HttpServlet {
	private static final long serialVersionUID = 1L;

     
	protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String username = request.getParameter("username");
		String password = request.getParameter("password");
		PrintWriter out = response.getWriter();
		
		int userID = loginUser(username, password, out); 
		
		// login
		if(userID >= 0) { 
			out.println(userID); 
			response.setStatus(HttpServletResponse.SC_OK);
			return; 
		} else {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		}
	}
	
	protected int loginUser(String username, String password, PrintWriter out) {
		Connection conn = null;
		Statement st = null;
		ResultSet rs = null;
		try {
			// Class.forName() may only bee needed with old JVMs, like JVM 14
			// In that case, also remove throws ClassNotFoundException
			Class.forName("com.mysql.cj.jdbc.Driver");
//			conn = DriverManager.getConnection("jdbc:mysql://localhost/TicketExchange?user=root&password=root");
			conn = MainDBConnection.getConnection();
					
			st = conn.createStatement();
			rs = st.executeQuery("SELECT user_id, password FROM users WHERE username = '" + username + "'");
			if(rs.next()) { // Check if user exists
				String storedPassword = rs.getString("password");
				if(!password.equals(storedPassword)) {// Check that the password is correct
					out.println("Incorrect password");
					return -1;
				}
				return Integer.parseInt(rs.getString("user_id"));
			} else {
				out.println("Nonexistent username");
				return -1;
			}
			
		} catch (SQLException sqle) {
			System.out.println ("SQLException: " + sqle.getMessage());
		} catch (ClassNotFoundException sqle) {
			System.out.println ("ClassNotFoundException: " + sqle.getMessage());
		} finally {
			try {
				if (rs != null) {
					rs.close();
				}
				if (st != null) {
					st.close();
				}
				if (conn != null) {
					conn.close();
				}
			} catch (SQLException sqle) {
				System.out.println("sqle: " + sqle.getMessage());
			}
		}
		return 0; 
	}
}