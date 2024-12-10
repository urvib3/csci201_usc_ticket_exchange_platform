import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class MainDBConnection {	
	static String DB_URL = "jdbc:mysql://localhost/TicketExchange?user=root&password=root";
	
	
	public static Connection getConnection() throws SQLException {
		Connection conn = null;
		
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			conn = DriverManager.getConnection(DB_URL);
			
		}
		catch(Exception e) {
			
		}
		return conn;
	}

}