import pyodbc

class Database:
    def __init__(self, server, database, username, password, port=1433):
        self.server = server
        self.database = database
        self.username = username
        self.password = password
        self.port = port
        self.conn = None

    def connect(self):
        conn_str = (
                f"DRIVER={{ODBC Driver 17 for SQL Server}};"
                f"SERVER={self.server},{self.port};"
                f"DATABASE={self.database};"
                f"UID={self.username};"
                f"PWD={self.password};"
                f"Encrypt=no;"
            )

        try:
            self.conn = pyodbc.connect(conn_str)
            return self.conn
        except Exception as e:
            raise Exception(f"Database connection failed: {e}")
            
    def get_connection(self):
        if not self.conn:
            self.connect()
        return self.conn