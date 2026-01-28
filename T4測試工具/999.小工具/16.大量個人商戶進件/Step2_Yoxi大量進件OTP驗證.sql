USE ICP_Admin

--BEGIN TRAN
DECLARE
    @CustomerApplyID		BIGINT ,  -- 商戶註冊ID,異動商戶註冊狀態用 (必填)
	@RegisterStatus			INT = 2,  --商戶後台資料設定 (必填)
	@AuthType		TINYINT = 1,
	@CellPhone		VARCHAR(15) ,
	@RealIP			BIGINT			= 0,
	@ProxyIP		BIGINT			= 0,
	@IsPrevRecord	TINYINT			= 1,
	@RtnTable		BIT				= 1,
	@RtnCode		INT				= NULL,
	@RtnMsg			NVARCHAR(100)	= NULL,
	@RecordId		BIGINT			= NULL,
	@AuthCode		VARCHAR(16)		= NULL,
	@ExpireDT		DATETIME		= NULL,
	@ExpireRange	INT				= 120,
	@Output_Code			INT,
	@Output_Msg				NVARCHAR(100),
	@AuthStatus				TINYINT = 0,
	@RtnPrevRecordId		BIGINT,
	@RtnPrevRecordAuthCode	VARCHAR(16),
	@RtnPrevRecordExpireDT	DATETIME,
	@Now					DATETIME = GETDATE(),
	@ErrorCountMax			INT			= 5,
	@RtnRecordId			BIGINT,
	@RtnAuthType			TINYINT,
	@RtnMID					BIGINT,
	@RtnAuthCode			VARCHAR(16),
	@RtnErrorCount			TINYINT		= 0,
	@RtnAuthStatus			TINYINT		= 0,
	@RtnExpireDT			DATETIME,
	@PwdType				TINYINT,
	@PwdTypeReset			BIT			= 0,
	@Today					DATE		= GETDATE(),
	@RtnCellPhone_Count		TINYINT,
	@RtnIP_Count			TINYINT,
	@RtnMID_Count			TINYINT,
	@CellPhone_CheckCount	TINYINT = 5,
	@IP_CheckCount			TINYINT = 20,
	@SMSError_CheckCount    TINYINT = 5,
	@AuthIDNO				VARCHAR(12),
	@IDNO			VARCHAR(12)		= NULL,
	@AuthErrorCount	INT				= 0,	
	@BrandTypeCode varchar(50)
	
SELECT @BrandTypeCode = BrandTypeCode 
FROM [ICP_Admin].[dbo].[Admin_Merchant_BrandType] 
WHERE Status = 1 AND BrandTypeName = 'Yoxi';

DECLARE DataCursor cursor for
	SELECT CustomerApplyID,
		   ContactCellPhone CellPhone
	FROM ICP_Admin.dbo.Admin_Merchant_CustomerData_Apply
	WHERE 
		  BrandTypeCode = @BrandTypeCode 
		  AND RegisterStatus = 7

OPEN DataCursor

FETCH NEXT FROM DataCursor INTO
@CustomerApplyID,
@CellPhone;

WHILE  @@FETCH_STATUS = 0
BEGIN
	--Step1：發送手機驗證碼
BEGIN
	--檢查資料
	BEGIN
		--檢查當天簡訊驗證次數
		EXEC [ICP_Statistics].[dbo].[ausp_Statistics_MerchantAuth_CheckAuthSMSCount_SIU]
			@CellPhone		= @CellPhone,
			@RealIP			= @RealIP,
			@ProxyIP		= @ProxyIP,
			@RtnTable		= 0,
			@AddCount		= 0,
			@RtnCode		= @Output_Code	OUTPUT,
			@RtnMsg			= @Output_Msg	OUTPUT

		IF @Output_Code <> 1
		BEGIN
			SET @RtnCode = 0
			SET @RtnMsg = @Output_Msg
			GOTO FINALMSG
		END
	END

	--準備資料
	BEGIN
		--取得上一筆待驗證
		SELECT TOP 1
			@RtnPrevRecordId		= [RecordId],
			@RtnPrevRecordAuthCode	= [AuthCode],
			@RtnPrevRecordExpireDT	= [ExpireDT]
		FROM
			[dbo].[Admin_Merchant_SMSVerifyRecord] WITH(NOLOCK)
		WHERE
			[ExpireDT] > @Now AND [CellPhone] = @CellPhone AND [AuthStatus] = 0

		---產生純數字驗證碼
		SET @AuthCode = FLOOR((999999 - 100000 + 1)* RAND() + 100000)

		SET @Now = GETDATE()
		SET @ExpireDT = DATEADD(SECOND, @ExpireRange, @Now)
	END

	--更新資料
	BEGIN
		--待驗證 同時只能有一筆
		IF @RtnPrevRecordId IS NOT NULL
		BEGIN
			UPDATE
				[dbo].[Admin_Merchant_SMSVerifyRecord]
			SET
				[AuthStatus] = 2
			WHERE
				RecordId = @RtnPrevRecordId

			IF @@ERROR <> 0 OR @@ROWCOUNT = 0
			BEGIN
				SET @RtnCode = 0
				SET @RtnMsg = '待驗證簡訊更新失敗'
				GOTO FINALMSG
			END

		END

		INSERT INTO [dbo].[Admin_Merchant_SMSVerifyRecord]
		(
			[AuthType],	
			[CellPhone], 
			[AuthStatus], 
			[AuthCode], 
			[ExpireDT], 
			[RealIP],	
			[ProxyIP]
		)
		VALUES
		(
			@AuthType,	
			@CellPhone,		
			@AuthStatus,	
			@AuthCode,	
			@ExpireDT,	
			@RealIP,	
			@ProxyIP
		)

		IF @@ERROR <> 0 OR @@ROWCOUNT = 0
		BEGIN
			SET @RtnCode = 0
			SET @RtnMsg = '新增簡訊資料失敗' 
			GOTO FINALMSG
		END

		SET @RecordId = SCOPE_IDENTITY()

		EXEC [ICP_Statistics].[dbo].[ausp_Statistics_MerchantAuth_CheckAuthSMSCount_SIU]
			@CellPhone		= @CellPhone,
			@RealIP			= @RealIP,
			@ProxyIP		= @ProxyIP,
			@RtnTable		= 0,
			@AddCount		= 1,
			@RtnCode		= @Output_Code	OUTPUT,
			@RtnMsg			= @Output_Msg	OUTPUT

		IF @Output_Code <> 1
		BEGIN
			SET @RtnCode = 0
			SET @RtnMsg = @Output_Msg
			GOTO FINALMSG
		END
	END

	SET @RtnCode = 1
	SET @RtnMsg = ''
END

--檢查資料
BEGIN
	IF @RecordId IS NULL
	BEGIN
		--取得最後一筆簡訊驗證
		SELECT TOP 1
			@RtnRecordId	= [RecordId],
			@RtnAuthType	= [AuthType],
			@RtnAuthCode	= [AuthCode],
			@RtnErrorCount	= [ErrorCount],
			@RtnAuthStatus	= [AuthStatus],
			@RtnExpireDT	= [ExpireDT]
		FROM
			[dbo].[Admin_Merchant_SMSVerifyRecord] WITH(NOLOCK)
		WHERE
			[CellPhone] = @CellPhone
		ORDER BY
			[RecordId] DESC
	END
	ELSE
	BEGIN
		SELECT TOP 1
			@RtnRecordId	= [RecordId],
			@RtnAuthType	= [AuthType],
			--@RtnMID			= [MID],
			@RtnAuthCode	= [AuthCode],
			@RtnErrorCount	= [ErrorCount],
			@RtnAuthStatus	= [AuthStatus],
			@RtnExpireDT	= [ExpireDT]
		FROM
			[dbo].[Admin_Merchant_SMSVerifyRecord] WITH(NOLOCK)
		WHERE
			[RecordId] = @RecordId
	END

	-- CellPhone 記錄
	SELECT TOP 1 @RtnCellPhone_Count = CellPhoneLoginCount
	FROM 
		[ICP_Statistics].[dbo].[Admin_Merchant_AuthSMS_CellPhone_LogRecord] WITH(NOLOCK)
	WHERE
		[CellPhone] = @CellPhone AND [CreateDate] = @Today

	-- IP 記錄
	IF ISNULL(@RealIP, 0) = 0 SET @RealIP = @ProxyIP
	IF ISNULL(@RealIP, 0) > 0
	BEGIN
		SELECT TOP 1 @RtnIP_Count = [IPLoginCount]
		FROM
			[ICP_Statistics].[dbo].[Admin_Merchant_AuthSMS_IP_LogRecord] WITH(NOLOCK)
		WHERE
			[RealIP] = @RealIP AND [CreateDate] = @Today
	END

	IF	@RtnRecordId IS NULL
	BEGIN
		SET @RtnCode = 0
		SET @RtnMsg = '查無驗證資料'
		GOTO FINALMSG
	END
	ELSE IF @AuthType IS NOT NULL AND @AuthType <> @RtnAuthType
	BEGIN
		SET @RtnCode = 0
		SET @RtnMsg = '驗證類別錯誤'
		GOTO FINALMSG
	END
	ELSE IF @RtnExpireDT <= @Now -- 已失效
	BEGIN
		IF @RtnCellPhone_Count >= @CellPhone_CheckCount OR @RtnIP_Count >= @IP_CheckCount --OR @RtnMID_Count >= @MID_CheckCount 
		BEGIN
			SET @RtnCode = 200066
			EXEC ICP_Share.dbo.ausp_ResultDictionary_GetResult_S
				@RtnCode	= @RtnCode,
				@RtnTable	= 0,
				@RtnMsg		= @RtnMsg OUTPUT
			GOTO FINALMSG
		END			
		ELSE
		BEGIN
			SET @RtnCode = 200034
			EXEC ICP_Share.dbo.ausp_ResultDictionary_GetResult_S
				@RtnCode	= @RtnCode,
				@RtnTable	= 0,
				@RtnMsg		= @RtnMsg OUTPUT
			GOTO FINALMSG
		END	
	END
	ELSE IF @RtnErrorCount >= @ErrorCountMax
	BEGIN
		SET @RtnCode = 200034
		EXEC ICP_Share.dbo.ausp_ResultDictionary_GetResult_S
			@RtnCode	= @RtnCode,
			@RtnTable	= 0,
			@RtnMsg		= @RtnMsg OUTPUT
		GOTO FINALMSG
	END
	ELSE IF @RtnAuthStatus <> 0
	BEGIN 
		SET @RtnCode = 0
		SET @RtnMsg = '驗證失敗'
		GOTO FINALMSG
	END
END

--更新資料
BEGIN
	--驗證失敗 OR 身份證字號輸入錯誤
	IF @AuthCode <> @RtnAuthCode --OR ( ISNULL(@AuthIDNO,'') <> '' AND ISNULL(@IDNO,'') <> @AuthIDNO )
	BEGIN
		UPDATE
			[dbo].[Admin_Merchant_SMSVerifyRecord]
		SET
			[ErrorCount]	= [ErrorCount] + 1,
			[AuthStatus]	= CASE WHEN [ErrorCount] + 1 < @ErrorCountMax THEN [AuthStatus] ELSE 2 END,
			[ModifyDT]		= GETDATE()
		WHERE
			[RecordId] = @RtnRecordId

		IF @@ERROR <> 0 OR @@ROWCOUNT = 0
		BEGIN
			SET @RtnCode = 0
			SET @RtnMsg = '更新資料失敗'
			GOTO FINALMSG
		END
		IF @RtnErrorCount+1 < @SMSError_CheckCount
		BEGIN
			SET @RtnCode = 200068
			EXEC ICP_Share.dbo.ausp_ResultDictionary_GetResult_S
				@RtnCode	= @RtnCode,
				@RtnTable	= 0,
				@RtnMsg		= @RtnMsg OUTPUT
			SET @RtnMsg = REPLACE(@RtnMsg, '{0}', CAST(@RtnErrorCount+1 AS NVARCHAR) )
		END
		ELSE
		BEGIN
			SET @RtnCode = 200069
			EXEC ICP_Share.dbo.ausp_ResultDictionary_GetResult_S
				@RtnCode	= @RtnCode,
				@RtnTable	= 0,
				@RtnMsg		= @RtnMsg OUTPUT
		END

		GOTO FINALMSG
	END


	UPDATE
		[dbo].[Admin_Merchant_SMSVerifyRecord]
	SET
		[AuthStatus]	= 1,
		[ModifyDT]		= GETDATE()
	WHERE
		[RecordId] = @RtnRecordId

	IF @@ERROR <> 0 OR @@ROWCOUNT = 0
	BEGIN
		SET @RtnCode = 0
		SET @RtnMsg = '更新資料失敗'
		GOTO FINALMSG
	END
END

IF @RtnCode = 1
BEGIN
	UPDATE ICP_Admin.dbo.Admin_Merchant_CustomerData_Apply
	SET RegisterStatus = @RegisterStatus,
	    ModifyDate = GETDATE(),
	    Modifier = 'OnlineContract'
	WHERE CustomerApplyID = @CustomerApplyID

	IF @@ERROR <> 0 OR @@ROWCOUNT = 0
	BEGIN
		SET @RtnCode = 0
		SET @RtnMsg = '更新資料失敗'
		GOTO FINALMSG
	END
END

SET @RtnCode = 1
SET @RtnMsg = ''

---### 最後回傳的資訊	
FINALMSG:
BEGIN
	SET @AuthErrorCount = @RtnErrorCount
	IF @RtnTable = 1
		BEGIN
			SELECT 
				@RtnCode		AS RtnCode,
				@RtnMsg			AS RtnMsg,
				@RecordId		AS RecordId,
				@AuthType		AS AuthType,
				@AuthCode		AS AuthCode,
				@CellPhone		AS CellPhone,
				@AuthCode		AS AuthCode,
				@ExpireDT		AS ExpireDT,
				@ExpireRange	AS ExpireRange,
				@AuthErrorCount	AS AuthErrorCount
		END
END
	FETCH NEXT FROM DataCursor INTO
	@CustomerApplyID,
	@CellPhone;
END

close DataCursor
deallocate DataCursor

